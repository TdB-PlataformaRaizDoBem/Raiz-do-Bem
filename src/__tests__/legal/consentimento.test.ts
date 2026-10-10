import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DATA_VIGENCIA,
  VERSAO_DOCUMENTOS,
  consentimentoParaEnvio,
  criarRegistroConsentimento,
} from '../../domain/legal/consentimento';

afterEach(() => vi.unstubAllEnvs());

describe('criarRegistroConsentimento', () => {
  it('registra qual termo, qual versão, quando e o que foi autorizado', () => {
    const registro = criarRegistroConsentimento(
      'pedido-de-ajuda',
      ['dados-pessoais', 'dados-sensiveis', 'responsavel-legal'],
      new Date('2026-10-10T15:30:00.000Z'),
    );

    expect(registro).toEqual({
      documento: 'pedido-de-ajuda',
      versao: VERSAO_DOCUMENTOS,
      aceitoEm: '2026-10-10T15:30:00.000Z',
      itens: ['dados-pessoais', 'dados-sensiveis', 'responsavel-legal'],
    });
  });

  it('usa a hora atual quando nenhuma é informada', () => {
    const antes = Date.now();
    const registro = criarRegistroConsentimento('voluntario', ['dados-cadastrais']);

    expect(Date.parse(registro.aceitoEm)).toBeGreaterThanOrEqual(antes);
  });
});

describe('consentimentoParaEnvio', () => {
  const registro = criarRegistroConsentimento('voluntario', ['dados-cadastrais']);

  it('não envia o registro enquanto a API não aceitar o campo (padrão)', () => {
    expect(consentimentoParaEnvio(registro)).toEqual({});
  });

  it('envia o registro quando VITE_ENVIAR_CONSENTIMENTO=true', () => {
    vi.stubEnv('VITE_ENVIAR_CONSENTIMENTO', 'true');

    expect(consentimentoParaEnvio(registro)).toEqual({ consentimento: registro });
  });
});

describe('vigência', () => {
  it('a data de vigência é uma data ISO válida', () => {
    expect(Number.isNaN(Date.parse(DATA_VIGENCIA))).toBe(false);
  });
});
