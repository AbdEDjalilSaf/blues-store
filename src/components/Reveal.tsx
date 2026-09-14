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

const BASE: CSSProperties = {
  opacity: 0,
  transform: 'translateY(28px)',
  transitionProperty: 'opacity, transform',
  transitionDuration: '.7s',
  transitionTimingFunction: 'cubic-bezier(.22,.61,.36,1)',
  willChange: 'opacity, transform',
};

const VISIBLE: Record<Effect, CSSProperties> = {
  'fade-up': { opacity: 1, transform: 'translateY(0)' },
  'zoom-in': { opacity: 1, transform: 'scale(1)' },
  'fade-in': { opacity: 1, transform: 'none' },
};

const HIDDEN: Record<Effect, CSSProperties> = {
  'fade-up': { opacity: 0, transform: 'translateY(28px)' },
  'zoom-in': { opacity: 0, transform: 'scale(.94)' },
  'fade-in': { opacity: 0, transform: 'none' },
};

export default function Reveal({ as: Tag = 'div', effect = 'fade-up', delay = 0, className, style, children, id }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return; }
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
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const merged: CSSProperties = {
    ...(shown ? VISIBLE[effect] : HIDDEN[effect]),
    ...BASE,
    ...(shown ? VISIBLE[effect] : HIDDEN[effect]),
    transitionDelay: delay ? `${delay}ms` : undefined,
    ...style,
  };

  return (
    <Tag ref={ref} id={id} className={className} style={merged}>
      {children}
    </Tag>
  );
}
