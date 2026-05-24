import Image from "next/image";

export function BrandWordmark({
  logoClassName,
  textClassName,
}: {
  logoClassName: string;
  textClassName: string;
}) {
  return (
    <div className={`brand-wordmark ${textClassName}`}>
      <Image
        src="/logo.png"
        alt=""
        width={176}
        height={176}
        className={`brand-background-logo ${logoClassName}`}
        priority
      />
      <span className="gradient-brand-text brand-wordmark-text">Proверь</span>
    </div>
  );
}
