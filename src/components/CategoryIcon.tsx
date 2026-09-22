import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 20, color }) => {
  // Safe lookup for dynamic icon name
  const IconComponent = (Icons as any)[name] || Icons.Tag;
  
  return <IconComponent size={size} className={className} style={color ? { color } : undefined} />;
};
