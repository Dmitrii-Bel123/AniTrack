import { useState } from 'react';

export default function Poster({ src, alt = '', eager = false }: {
  src: string | null; alt?: string; eager?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return src && failedSource !== src
    ? <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} onError={() => setFailedSource(src)} />
    : <span className="poster-placeholder" aria-label={alt || undefined} aria-hidden={!alt}>( A )</span>;
}
