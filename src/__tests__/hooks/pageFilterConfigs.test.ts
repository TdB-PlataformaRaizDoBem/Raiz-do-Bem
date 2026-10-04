import { describe, expect, it } from '@jest/globals';
import {
  atendimentoFilterConfig,
  beneficiarioFilterConfig,
  colaboradorFilterConfig,
  dentistaFilterConfig,
  designacaoFilterConfig,
  pedidoFilterConfig,
} from '../../hooks/pageFilterConfigs';
import { mapAtendimento } from '../../domain/mappers/AtendimentoMapper';
import { mapBeneficiario } from '../../domain/mappers/Beneficiariomapper';
import { mapColaborador } from '../../domain/mappers/ColaboradorMapper';
import { mapDentista } from '../../domain/mappers/DentistaMapper';
import { mapPedido } from '../../domain/mappers/PedidoMapper';
import { atendimentoApi, beneficiarioApi, colaboradorApi, dentistaApi, pedidoApi } from '../../test/factories';
import { normalizeText } from '../../hooks/useSmartFilter';

/** Executa o predicado como o useSmartFilter faz: busca já normalizada. */
const busca = (texto: string) => normalizeText(texto);

describe('colaboradorFilterConfig', () => {
  const c = mapColaborador(colaboradorApi({ nomeCompleto: 'Ana Souza', email: 'ana@x.com', cpf: '12345678901' }));
  const p = colaboradorFilterConfig.predicate;

  it('declara o grupo "Nível de acesso"', () => {
    expect(colaboradorFilterConfig.groups.map((g) => g.key)).toEqual(['nivel']);
  });

  it('sem busca aceita tudo (o nível não existe no view model)', () => {
    expect(p(c, { nivel: 'admin' }, '')).toBe(true);
  });

  it.each(['souza', 'ANA@X', '1234567'])('busca %p encontra por nome, e-mail ou CPF', (texto) => {
    expect(p(c, {}, busca(texto))).toBe(true);
  });

  it('busca sem correspondência rejeita', () => {
    expect(p(c, {}, busca('zzz'))).toBe(false);
  });
});

describe('beneficiarioFilterConfig', () => {
  const p = beneficiarioFilterConfig.predicate;
  const b = mapBeneficiario(beneficiarioApi({ nomeCompleto: 'José Souza', email: 'jose@x.com', cpf: '98765432100' }));

  it.each(['souza', 'jose@x', '9876', 'são paulo', 'sp'])('busca %p encontra por nome, e-mail, CPF, cidade ou estado', (texto) => {
    expect(p(b, {}, busca(texto))).toBe(true);
  });

  it('busca sem correspondência rejeita', () => {
    expect(p(b, {}, busca('zzz'))).toBe(false);
  });

  it('filtro de programa compara sem acento e caixa', () => {
    expect(p(b, { programa: 'Dentista Do Bem' }, '')).toBe(true);
    expect(p(b, { programa: 'Apolonia do Bem' }, '')).toBe(false);
  });

  it('beneficiário sem endereço nem programa não quebra', () => {
    const sem = { ...mapBeneficiario(beneficiarioApi({ endereco: null })), programaSocial: null };

    expect(p(sem, {}, busca('maria'))).toBe(true);
    expect(p(sem, {}, busca('são paulo'))).toBe(false);
    expect(p(sem, { programa: 'Dentista Do Bem' }, '')).toBe(false);
  });
});

describe('dentistaFilterConfig', () => {
  const p = dentistaFilterConfig.predicate;
  const d = mapDentista(dentistaApi({ nomeCompleto: 'Dra. Íris', croDentista: 'CRO-SP 777', especialidades: ['Endodontia'] }));

  it('declara os grupos de disponibilidade e programa', () => {
    expect(dentistaFilterConfig.groups.map((g) => g.key)).toEqual(['disponivel', 'programa']);
  });

  it.each(['iris', 'sp 777', '12345678901', 'endodontia', 'são paulo', 'sp'])('busca %p', (texto) => {
    expect(p(d, {}, busca(texto))).toBe(true);
  });

  it('busca sem correspondência rejeita', () => {
    expect(p(d, {}, busca('zzz'))).toBe(false);
  });

  it('disponibilidade: sim/nao nos dois sentidos', () => {
    const livre = mapDentista(dentistaApi({ disponivel: 'S' }));
    const ocupado = mapDentista(dentistaApi({ disponivel: 'N' }));

    expect(p(livre, { disponivel: 'sim' }, '')).toBe(true);
    expect(p(ocupado, { disponivel: 'sim' }, '')).toBe(false);
    expect(p(ocupado, { disponivel: 'nao' }, '')).toBe(true);
    expect(p(livre, { disponivel: 'nao' }, '')).toBe(false);
    expect(p(livre, { disponivel: '' }, '')).toBe(true);
  });

  it('programa: compara o programa do dentista sem acento/caixa', () => {
    expect(p(d, { programa: 'Dentista Do Bem' }, '')).toBe(true);
    expect(p(d, { programa: 'Apolonia do Bem' }, '')).toBe(false);
  });

  it('dentista sem endereço nem especialidades não quebra a busca', () => {
    const sem = mapDentista(dentistaApi({ cidade: null, estado: null, especialidades: [] }));
    expect(p(sem, {}, busca('dr'))).toBe(true);
  });
});

describe('pedidoFilterConfig', () => {
  const p = pedidoFilterConfig.predicate;
  const ped = mapPedido(pedidoApi({ id: 4321, nomeCompleto: 'Maria Lima', descricaoProblema: 'Dente quebrado', endereco: 'Rua das Flores, 5' }));

  it('declara os grupos de status e dentista', () => {
    expect(pedidoFilterConfig.groups.map((g) => g.key)).toEqual(['status', 'dentista']);
  });

  it.each(['lima', '4321', 'quebrado', 'flores', '123.456'])('busca %p', (texto) => {
    expect(p(ped, {}, busca(texto))).toBe(true);
  });

  it('busca sem correspondência rejeita', () => {
    expect(p(ped, {}, busca('zzz'))).toBe(false);
  });

  it('filtra por status', () => {
    expect(p(ped, { status: 'PENDENTE' }, '')).toBe(true);
    expect(p(ped, { status: 'APROVADO' }, '')).toBe(false);
  });

  it('filtra por dentista vinculado', () => {
    const com = mapPedido(pedidoApi({ dentistaResponsavel: 'Dr. X' }));
    expect(p(ped, { dentista: 'sem' }, '')).toBe(true);
    expect(p(ped, { dentista: 'com' }, '')).toBe(false);
    expect(p(com, { dentista: 'com' }, '')).toBe(true);
    expect(p(com, { dentista: 'sem' }, '')).toBe(false);
  });

  it('pedido sem endereço continua pesquisável', () => {
    const sem = mapPedido(pedidoApi({ endereco: null as unknown as string }));
    expect(p(sem, {}, busca('maria'))).toBe(true);
  });
});

describe('designacaoFilterConfig (beneficiários pendentes)', () => {
  const p = designacaoFilterConfig.predicate;
  const b = mapBeneficiario(beneficiarioApi({ nomeCompleto: 'Pedro Alves', cpf: '11122233344' }));

  it('não tem grupos de filtro', () => {
    expect(designacaoFilterConfig.groups).toEqual([]);
  });

  it.each(['alves', '1112223', 'são paulo'])('busca %p', (texto) => {
    expect(p(b, {}, busca(texto))).toBe(true);
  });

  it('sem correspondência e sem busca', () => {
    expect(p(b, {}, busca('zzz'))).toBe(false);
    expect(p(b, {}, '')).toBe(true);
  });

  it('beneficiário sem endereço', () => {
    expect(p(mapBeneficiario(beneficiarioApi({ endereco: null })), {}, busca('maria'))).toBe(true);
  });
});

describe('atendimentoFilterConfig', () => {
  const p = atendimentoFilterConfig.predicate;
  const a = mapAtendimento(atendimentoApi({ id: 77, beneficiario: 'Lúcia Dias', dentista: 'Dr. Paulo', prontuario: 'Canal' }));

  it('não tem grupos de filtro', () => {
    expect(atendimentoFilterConfig.groups).toEqual([]);
  });

  it.each(['lucia', 'paulo', 'canal', '77'])('busca %p', (texto) => {
    expect(p(a, {}, busca(texto))).toBe(true);
  });

  it('sem correspondência e sem busca', () => {
    expect(p(a, {}, busca('zzz'))).toBe(false);
    expect(p(a, {}, '')).toBe(true);
  });
});
