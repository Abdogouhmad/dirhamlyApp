interface TypographyPProps {
  text: string;
  className?: string;
}

export function TypographyH1({ text, className }: TypographyPProps) {
  return (
    <h1 className={`scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance ${className || ''}`}>
      {text}
    </h1>
  );
}
export function TypographyP({ text, className }: TypographyPProps) {
  return <p className={`leading-7 not-first:mt-6 ${className || ''}`}>{text}</p>;
}

export function TypographyH2({ text, className }: TypographyPProps) {
  return (
    <h2 className={`scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 ${className || ''}`}>
      {text}
    </h2>
  );
}
