/** Chaves do cache: mesma chave = mesma requisição compartilhada. */
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
