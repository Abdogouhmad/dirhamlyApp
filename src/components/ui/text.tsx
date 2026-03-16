interface TypographyPProps {
  text: string;
}

export function TypographyH1({ text }: TypographyPProps) {
  return (
    <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance">
      {text}
    </h1>
  );
}
export function TypographyP({ text }: TypographyPProps) {
  return <p className="leading-7 not-first:mt-6">{text}</p>;
}

export function TypographyH2({ text }: TypographyPProps) {
  return (
    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
      {text}
    </h2>
  );
}
