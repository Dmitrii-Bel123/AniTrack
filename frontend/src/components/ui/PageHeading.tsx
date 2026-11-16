import type { ReactNode } from 'react';

export default function PageHeading({ index, label, title, children }: {
  index: string; label: string; title: string; children?: ReactNode;
}) {
  return <header className="page-heading">
    <div><p className="eyebrow">({index}) — {label}</p><h1>{title}<span className="heading-dot">.</span></h1></div>
    {children}
  </header>;
}
