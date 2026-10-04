interface Props {
  className?: string;
}

/**
 * شعار بلوز سيتي.
 *
 * NOTE: `logoNew.png` is a 500x500 / ~94 KB raster displayed at 40px. It is the
 * worst size-to-weight ratio in the project and the largest above-the-fold
 * asset after the hero. Replace it with an optimized ~80x80 (webp or png) and
 * keep the intrinsic size below in sync.
 */
export default function Logo({ className = '' }: Props) {
  return (
    <img
      src="/images/logoNew.png"
      alt="شعار بلوز سيتي"
      width={80}
      height={80}
      decoding="async"
      loading="eager"
      fetchPriority="high"
      className={`${className} w-10 h-10 shrink-0 object-cover rounded-lg`}
    />
  );
}