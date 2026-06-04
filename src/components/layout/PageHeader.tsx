import Image from 'next/image';

type PageHeaderProps = {
  title: string;
  description: string;
  imageSrc?: string;
};

export function PageHeader({ title, description, imageSrc }: PageHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 shadow-xl">
      {imageSrc ? (
        <div className="absolute inset-0 opacity-30">
          <Image src={imageSrc} alt="" fill className="object-cover" sizes="100vw" priority />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent" />
      <div className="relative px-8 py-14 sm:px-10 sm:py-20">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-primary" />
          <div className="h-1 w-3 rounded-full bg-primary/50" />
        </div>
        <h1 className="mb-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {description}
        </p>
      </div>
    </div>
  );
}
