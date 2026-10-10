import { describe, expect, it } from 'vitest';
import {
  centroideDaUf,
  UF_POR_CODIGO,
  UF_POR_SIGLA,
  UFS,
} from '../../domain/entities/UnidadesFederativas';

describe('UFS', () => {
  it('tem as 27 Unidades da Federação, sem repetição de sigla ou código IBGE', () => {
    expect(UFS).toHaveLength(27);
    expect(new Set(UFS.map((uf) => uf.sigla)).size).toBe(27);
    expect(new Set(UFS.map((uf) => uf.codigo)).size).toBe(27);
  });

  it('o código IBGE tem 2 dígitos e o centroide fica dentro do Brasil', () => {
    for (const uf of UFS) {
      expect(uf.codigo).toMatch(/^\d{2}$/);
      const [lat, lng] = uf.centroide;
      expect(lat).toBeGreaterThan(-34);
      expect(lat).toBeLessThan(6);
      expect(lng).toBeGreaterThan(-75);
      expect(lng).toBeLessThan(-34);
    }
  });

  it('os índices por sigla e por código apontam para a mesma UF', () => {
    expect(UF_POR_SIGLA.get('SP')?.nome).toBe('São Paulo');
    expect(UF_POR_CODIGO.get('35')?.sigla).toBe('SP');
    expect(UF_POR_SIGLA.size).toBe(27);
    expect(UF_POR_CODIGO.size).toBe(27);
  });
});

describe('centroideDaUf', () => {
  it('devolve [lat, lng] da UF, sem diferenciar maiúsculas', () => {
    expect(centroideDaUf('MA')).toEqual([-5.08, -45.28]);
    expect(centroideDaUf('ma')).toEqual([-5.08, -45.28]);
  });

  it('devolve null para sigla desconhecida', () => {
    expect(centroideDaUf('XX')).toBeNull();
    expect(centroideDaUf('')).toBeNull();
  });
});
