'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: ModalSize;
  showClose?: boolean;
  align?: 'center' | 'bottom';
  zIndex?: '50' | '60';
  className?: string;
  panelClassName?: string;
};

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  align = 'center',
  zIndex = '50',
  className = '',
  panelClassName = '',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={[
        'talora-modal-overlay',
        zIndex === '60' ? 'z-[60]' : 'z-50',
        align === 'bottom' ? 'items-end sm:items-center p-0 sm:p-4' : 'items-center justify-center p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'talora-modal-title' : undefined}
    >
      <button
        type="button"
        className="talora-modal-backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className={[
          'talora-modal-panel relative w-full max-h-[90vh] overflow-y-auto',
          SIZE_CLASS[size],
          panelClassName,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {(title || showClose) && (
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
            {title ? (
              <h2 id="talora-modal-title" className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className={title || showClose ? 'p-6' : 'p-6'}>{children}</div>
      </div>
    </div>
  );
}
