import * as htmlToImage from 'html-to-image';
import html2pdf from 'html2pdf.js';

export function formatFileName(template: string, title: string) {
  const now = new Date();
  return template
    .replace(/\{judul\}/gi, title || 'Untitled')
    .replace(/%YYYY/g, String(now.getFullYear()))
    .replace(/%MM/g, String(now.getMonth() + 1).padStart(2, '0'))
    .replace(/%DD/g, String(now.getDate()).padStart(2, '0'))
    .replace(/%HH/g, String(now.getHours()).padStart(2, '0'))
    .replace(/%mm/g, String(now.getMinutes()).padStart(2, '0'))
    .replace(/%ss/g, String(now.getSeconds()).padStart(2, '0'));
}

async function waitForFonts() {
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    console.warn('Font loading check failed:', error);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

async function imageToDataURL(imagePath: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = imagePath;
  });
}

async function createOffscreenIframe(htmlString: string): Promise<HTMLIFrameElement> {
  const logoPath = '/assets/icons/logo-bme.png';
  let logoDataURL = '';

  try {
    logoDataURL = await imageToDataURL(logoPath);
  } catch (error) {
    console.warn('Could not convert logo to data URL:', error);
  }

  if (logoDataURL) {
    htmlString = htmlString
      .replace(/src="\/assets\/icons\/logo-bme\.png"/g, `src="${logoDataURL}"`)
      .replace(/src="assets\/icons\/logo-bme\.png"/g, `src="${logoDataURL}"`);
  }

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.opacity = '0.001';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  iframe.style.border = 'none';

  document.body.appendChild(iframe);
  iframe.srcdoc = htmlString;

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve();
    setTimeout(resolve, 600);
  });

  return iframe;
}

function removeOffscreenIframe(iframe: HTMLIFrameElement) {
  if (iframe && iframe.parentNode) {
    iframe.parentNode.removeChild(iframe);
  }
}

export async function exportToPNG(htmlString: string, filename: string): Promise<boolean> {
  let iframe: HTMLIFrameElement | null = null;
  try {
    await waitForFonts();
    iframe = await createOffscreenIframe(htmlString);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Iframe document not accessible');

    const pageContainer = iframeDoc.querySelector('.page-container') as HTMLElement;
    const targetElement = pageContainer || iframeDoc.body;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const dataUrl = await htmlToImage.toPng(targetElement, {
      quality: 1.0,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('PNG export failed:', error);
    alert('Gagal mengekspor ke PNG.');
    return false;
  } finally {
    if (iframe) removeOffscreenIframe(iframe);
  }
}

export async function exportToJPEG(htmlString: string, filename: string): Promise<boolean> {
  let iframe: HTMLIFrameElement | null = null;
  try {
    await waitForFonts();
    iframe = await createOffscreenIframe(htmlString);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Iframe document not accessible');

    const pageContainer = iframeDoc.querySelector('.page-container') as HTMLElement;
    const targetElement = pageContainer || iframeDoc.body;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const dataUrl = await htmlToImage.toJpeg(targetElement, {
      quality: 0.95,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#ffffff',
      skipFonts: true,
      fontEmbedCSS: '',
    });

    const link = document.createElement('a');
    link.download = `${filename}.jpeg`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('JPEG export failed:', error);
    alert('Gagal mengekspor ke JPEG.');
    return false;
  } finally {
    if (iframe) removeOffscreenIframe(iframe);
  }
}

export async function exportToPDF(htmlString: string, filename: string): Promise<boolean> {
  let iframe: HTMLIFrameElement | null = null;
  try {
    await waitForFonts();
    iframe = await createOffscreenIframe(htmlString);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Iframe document not accessible');

    const pageContainer = (iframeDoc.querySelector('.page-container') || iframeDoc.body) as HTMLElement;

    await new Promise((resolve) => setTimeout(resolve, 500));

    const opt = {
      margin: 0,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    // Use html2pdf.js to directly convert HTML to PDF file download
    const html2pdfFunc = typeof html2pdf === 'function' ? html2pdf : (html2pdf as any).default;
    await html2pdfFunc().set(opt).from(pageContainer).save();
    return true;
  } catch (error) {
    console.error('html2pdf export failed:', error);
    try {
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(htmlString);
        w.document.close();
        w.document.title = filename || 'Dokumen';
        setTimeout(() => {
          w.focus();
          w.print();
        }, 300);
      }
    } catch (e) {
      alert('Gagal mengekspor ke PDF.');
    }
    return false;
  } finally {
    if (iframe) removeOffscreenIframe(iframe);
  }
}
