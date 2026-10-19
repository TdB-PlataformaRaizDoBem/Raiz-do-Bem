import { Fragment } from "react";

/**
 * Mostra um texto do guia, transformando o que está entre `**dois asteriscos**` em negrito.
 * Os negritos marcam o nome exato de botões e campos como aparecem na tela.
 */
export const Texto = ({ children }: { children: string }) => (
  <>
    {children.split("**").map((parte, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-black">
          {parte}
        </strong>
      ) : (
        <Fragment key={i}>{parte}</Fragment>
      ),
    )}
  </>
);
