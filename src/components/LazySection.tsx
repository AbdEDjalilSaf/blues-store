import { useEffect, useRef, useState, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Placeholder height so the scrollbar does not jump when the chunk lands. */
  minHeight?: number;
  /** Start loading this far before the section scrolls into view. */
  rootMargin?: string;
}

/**
 * Defers mounting (and therefore downloading) of a lazy chunk until the user
 * gets close to it. `React.lazy` on its own does nothing for below-the-fold
 * content: the component still renders on mount, so the chunk is fetched
 * immediately in the same waterfall as the entry bundle.
 */
export default function LazySection({ children, minHeight = 480, rootMargin = '800px' }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Seeded from the environment so the effect never has to call setState.
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setNear(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near, rootMargin]);

  return (
    <div ref={ref} style={near ? undefined : { minHeight }}>
      {near ? children : null}
    </div>
  );
}