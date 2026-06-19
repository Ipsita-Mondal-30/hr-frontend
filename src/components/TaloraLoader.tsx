'use client';

import Image from 'next/image';

type TaloraLoaderProps = {
  message?: string;
  fullScreen?: boolean;
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE = {
  sm: { outer: 56, logo: 32 },
  md: { outer: 80, logo: 48 },
  lg: { outer: 104, logo: 64 },
} as const;

export default function TaloraLoader({
  message = 'Loading...',
  fullScreen = false,
  dark = false,
  size = 'md',
  className = '',
}: TaloraLoaderProps) {
  const dim = SIZE[size];

  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-4',
        fullScreen ? 'min-h-screen w-full' : 'min-h-[40vh] w-full py-10',
        dark ? 'bg-slate-950' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="relative" style={{ width: dim.outer, height: dim.outer }}>
        <div className="talora-loader-ring absolute inset-0 rounded-2xl" aria-hidden />
        <div className="talora-loader-glow absolute inset-0 rounded-2xl" aria-hidden />
        <div className="absolute inset-[4px] flex items-center justify-center rounded-xl bg-white shadow-inner">
          <Image
            src="/talora.png"
            alt=""
            width={dim.logo}
            height={dim.logo}
            className="talora-loader-logo rounded-lg"
            priority
          />
        </div>
      </div>
      {message ? (
        <p
          className={[
            'text-sm font-medium tracking-wide talora-loader-text',
            dark ? 'text-white/75' : 'text-slate-600',
          ].join(' ')}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
