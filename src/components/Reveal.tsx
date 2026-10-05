import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type ElementType } from 'react';

type Effect = 'fade-up' | 'zoom-in' | 'fade-in';

interface Props {
  as?: ElementType;
  effect?: Effect;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  id?: string;
}

const TRANSITION: CSSProperties = {
  transitionProperty: 'opacity, transform',
  transitionDuration: '.7s',
  transitionTimingFunction: 'cubic-bezier(.22,.61,.36,1)',
};

const FROM: Record<Effect, CSSProperties> = {
  'fade-up': { opacity: 0, transform: 'translateY(28px)' },
  'zoom-in': { opacity: 0, transform: 'scale(.94)' },
  'fade-in': { opacity: 0, transform: 'none' },
};

const TO: Record<Effect, CSSProperties> = {
  'fade-up': { opacity: 1, transform: 'translateY(0)' },
  'zoom-in': { opacity: 1, transform: 'scale(1)' },
  'fade-in': { opacity: 1, transform: 'none' },
};

export default function Reveal({ as: Tag = 'div', effect = 'fade-up', delay = 0, className, style, children, id }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  // Seeded from the environment so the effect never has to call setState.
  const [shown, setShown] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px -50px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  // `will-change` is only applied while the element is still animating. Leaving
  // it on permanently promotes every revealed block to its own compositor
  // layer for the life of the page, which costs memory and GPU time.
  const merged: CSSProperties = {
    ...TRANSITION,
    ...(shown ? TO[effect] : { ...FROM[effect], willChange: 'opacity, transform' }),
    transitionDelay: delay ? `${delay}ms` : undefined,
    ...style,
  };

  return (
    <Tag ref={ref} id={id} className={className} style={merged}>
      {children}
    </Tag>
  );
}