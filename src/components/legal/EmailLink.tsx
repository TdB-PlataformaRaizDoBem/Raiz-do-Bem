/** Link `mailto:` com o estilo dos documentos legais. */
export const EmailLink = ({ endereco }: { endereco: string }) => (
  <a href={`mailto:${endereco}`} className="font-bold text-[#7a3f0a] underline underline-offset-2 hover:text-darkgreen">
    {endereco}
  </a>
);
