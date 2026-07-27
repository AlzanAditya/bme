import React from 'react';

interface IconProps {
  name: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
  id?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, className, style, color, id }) => {
  return (
    <i-ui
      id={id}
      name={name}
      size={size}
      class={className}
      className={className}
      style={style}
      color={color}
    />
  );
};

export default Icon;
