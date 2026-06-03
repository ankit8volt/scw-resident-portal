import Image from 'next/image';

type PageHeaderProps = {
  title: string;
  description: string;
  imageSrc?: string;
};

export function PageHeader({ title, description, imageSrc }: PageHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5">
      {imageSrc ? (
        <div className="absolute inset-0 opacity-30">
          <Image src={imageSrc} alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
      ) : null}
      <div className="relative px-6 py-12 sm:px-8 sm:py-16">
        <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
