import React, { useRef, useState, useEffect } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';
import { AIRadialOverlay, AIRadialOverlayRef } from './AIRadialOverlay';

interface MobileNavProps {
  onShowAlert?: (msg: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onShowAlert }) => {
  const { activeTab, navigateToMode } = useAppState();
  const currentMode = activeTab?.mode || 'dashboard';

  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [activeRadialAction, setActiveRadialAction] = useState<'camera' | 'gallery' | 'mic' | null>(null);
  const [anchorPos, setAnchorPos] = useState<{ x: number; y: number } | null>(null);

  const radialOverlayRef = useRef<AIRadialOverlayRef>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeActionRef = useRef<'camera' | 'gallery' | 'mic' | null>(null);

  const updateSelectedRadialAction = (x: number, y: number) => {
    const camBtn = document.getElementById('btn-radial-camera');
    const galBtn = document.getElementById('btn-radial-gallery');
    const micBtn = document.getElementById('btn-radial-mic');

    const buttons = [
      { el: camBtn, name: 'camera' as const },
      { el: galBtn, name: 'gallery' as const },
      { el: micBtn, name: 'mic' as const },
    ];

    let closest: 'camera' | 'gallery' | 'mic' | null = null;
    let minDistance = 70; // px threshold

    buttons.forEach((btn) => {
      if (!btn.el) return;
      const rect = btn.el.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(x - btnCenterX, y - btnCenterY);

      if (dist < minDistance) {
        minDistance = dist;
        closest = btn.name;
      }
    });

    setActiveRadialAction(closest);
    activeActionRef.current = closest;
    return closest;
  };

  const startHold = (clientX: number, clientY: number, targetEl: HTMLElement) => {
    startPosRef.current = { x: clientX, y: clientY };
    isHoldingRef.current = false;
    activeActionRef.current = null;
    setActiveRadialAction(null);

    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      const rect = targetEl.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setAnchorPos({ x: centerX, y: centerY });
      setIsRadialOpen(true);

      if (navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch (e) {
          // ignore
        }
      }
    }, 250);
  };

  const moveHold = (clientX: number, clientY: number) => {
    if (!isHoldingRef.current && holdTimerRef.current) {
      const dist = Math.hypot(clientX - startPosRef.current.x, clientY - startPosRef.current.y);
      if (dist > 10) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }

    if (isHoldingRef.current) {
      updateSelectedRadialAction(clientX, clientY);
    }
  };

  const endHold = (clientX?: number, clientY?: number) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (isHoldingRef.current) {
      let action = activeActionRef.current;
      if (clientX !== undefined && clientY !== undefined) {
        action = updateSelectedRadialAction(clientX, clientY);
      }

      setIsRadialOpen(false);
      isHoldingRef.current = false;

      if (action) {
        radialOverlayRef.current?.triggerAction(action);
      }
      setActiveRadialAction(null);
      activeActionRef.current = null;
    } else {
      // Short tap / click -> Navigate to AI tab
      navigateToMode('ai');
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    startHold(touch.clientX, touch.clientY, e.currentTarget);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.touches[0];
    moveHold(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    const touch = e.changedTouches ? e.changedTouches[0] : null;
    endHold(touch?.clientX, touch?.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    startHold(e.clientX, e.clientY, e.currentTarget);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isHoldingRef.current) {
        moveHold(e.clientX, e.clientY);
      }
    };
    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isHoldingRef.current) {
        endHold(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <>
      <AIRadialOverlay
        ref={radialOverlayRef}
        isOpen={isRadialOpen}
        activeAction={activeRadialAction}
        anchorPos={anchorPos}
        onClose={() => {
          setIsRadialOpen(false);
          setActiveRadialAction(null);
          activeActionRef.current = null;
        }}
        onShowAlert={onShowAlert}
      />
      <nav className="tab-nav">
        <button
          className={`tab-btn ${currentMode === 'dashboard' ? 'active' : ''}`}
          data-tab="dashboard"
          onClick={() => navigateToMode('dashboard')}
        >
          <Icon name="home-line" size={20} />
          <span>Beranda</span>
        </button>

        <button
          className={`tab-btn ${currentMode === 'manual' ? 'active' : ''}`}
          data-tab="manual"
          onClick={() => navigateToMode('manual')}
        >
          <Icon name="file-02" size={20} />
          <span>Manual</span>
        </button>

        <div className="tab-btn-ai-wrapper">
          <button
            className={`tab-btn tab-btn-ai ${currentMode === 'ai' ? 'active' : ''}`}
            data-tab="ai"
            title="AI Mode"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <Icon name="star-04" size={22} />
          </button>
        </div>

        <button
          className={`tab-btn ${currentMode === 'finance' ? 'active' : ''}`}
          data-tab="finance"
          onClick={() => navigateToMode('finance')}
        >
          <Icon name="bar-line-chart" size={20} />
          <span>Keuangan</span>
        </button>

        <button
          className={`tab-btn ${currentMode === 'history' ? 'active' : ''}`}
          data-tab="history"
          onClick={() => navigateToMode('history')}
        >
          <Icon name="hourglass-02" size={20} />
          <span>Histori</span>
        </button>
      </nav>
    </>
  );
};

