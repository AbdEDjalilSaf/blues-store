interface Props {
  className?: string;
} 

/** شعار بلوز سيتي — الصورة المرجعية العلوية */
export default function Logo({ className = '' }: Props) {
  return (
    <img
      src="/images/logoNew.png"
      alt="شعار بلوز سيتي"
      width={80}
      height={80}
      decoding="async"
      loading="lazy"
      className={`${className}  shrink-0 object-cover`}
    />
  );
}
