import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  href?: string;
  seeAllLabel?: string;
  leftElement?: ReactNode;
}

export default function SectionHeader({ title, href, seeAllLabel = 'SEE ALL', leftElement }: Props) {
  return (
    <div className="flex items-center justify-between px-4 mb-2">
      <div className="flex items-center gap-2">
        {leftElement}
        <h2 className="text-[17px] font-bold text-text-primary">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-[13px] font-semibold text-primary hover:underline">
          {seeAllLabel}
        </Link>
      )}
    </div>
  );
}
