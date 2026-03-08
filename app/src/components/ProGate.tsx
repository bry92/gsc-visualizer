import type { ReactNode } from 'react';

type Props = {
  isPro: boolean;
  children: ReactNode;
};

export default function ProGate({ isPro, children }: Props) {
  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute right-4 top-4 z-10 rounded-md bg-black/70 px-3 py-1 text-xs font-medium text-white">
        Pro Feature
      </div>
      <div className="pointer-events-none opacity-60">
        {children}
      </div>
    </div>
  );
}
