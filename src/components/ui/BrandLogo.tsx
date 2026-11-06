import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'icon' | 'compact';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
  tagline?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = false,
  tagline = 'AI Quote Generator',
}) => {
  // Quotivo official brand logo
  const logoSrc = '/assets/aistudio/file_00000000d028821188b94c049d11936a_982d6ed1.png';

  const sizeClasses = {
    xs: { height: 'h-5', text: 'text-xs' },
    sm: { height: 'h-6', text: 'text-sm' },
    md: { height: 'h-7 sm:h-8', text: 'text-base' },
    lg: { height: 'h-9 sm:h-10', text: 'text-lg' },
    xl: { height: 'h-11 sm:h-12', text: 'text-xl' },
  }[size];

  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
        {/* Crisp cropped view of the electric blue 'Q' glyph */}
        <div className={`${sizeClasses.height} aspect-square overflow-hidden rounded-lg flex items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 p-0.5`}>
          <img
            src={logoSrc}
            alt="Quotivo Q Icon"
            className="h-[175%] max-w-none -translate-x-[6%] object-contain"
            loading="eager"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      {/* Quotivo full logo with automatic light/dark substrate handling */}
      <div className="relative flex items-center">
        {/* In dark mode, an ultra-subtle white substrate makes the dark letters 100% crisp and readable */}
        <div className="dark:bg-white/95 dark:px-2 dark:py-0.5 dark:rounded-md transition-all">
          <img
            src={logoSrc}
            alt="Quotivo"
            className={`${sizeClasses.height} w-auto object-contain select-none`}
            loading="eager"
          />
        </div>
      </div>

      {showTagline && (
        <span className="hidden sm:inline-block text-[11px] font-medium tracking-tight text-neutral-400 dark:text-neutral-500 border-l border-neutral-200 dark:border-neutral-800 pl-2.5">
          {tagline}
        </span>
      )}
    </div>
  );
};
