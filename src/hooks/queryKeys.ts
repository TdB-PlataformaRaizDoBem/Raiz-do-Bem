/**
 * Chaves do cache. Quem usa a mesma chave compartilha a mesma requisição:
 * por exemplo, o dashboard, a tela de beneficiários e a busca de contatos do chat
 * leem todos de `["beneficiarios"]` e disparam apenas um GET /beneficiario.
 */
export const queryKeys = {
  beneficiarios: ["beneficiarios"] as const,
  beneficiario: (cpf: string) => ["beneficiarios", cpf] as const,
  dentistas: ["dentistas"] as const,
  dentista: (cpf: string) => ["dentistas", cpf] as const,
  pedidos: ["pedidos"] as const,
  colaboradores: ["colaboradores"] as const,
  atendimentos: ["atendimentos"] as const,
  especialidades: ["especialidades"] as const,
  programasSociais: ["programas-sociais"] as const,
};
