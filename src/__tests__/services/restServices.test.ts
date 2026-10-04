import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  criarAtendimento,
  encerrarAtendimento,
  excluirAtendimento,
  exportarAtendimentosCsv,
  getAtendimentoPorCpf,
  getAtendimentos,
} from '../../services/AtendimentoService';
import {
  atualizarBeneficiario,
  criarBeneficiario,
  excluirBeneficiario,
  exportarBeneficiariosCsv,
  getBeneficiarioCompleto,
  getBeneficiariosCompletos,
} from '../../services/Beneficiarioservice';
import {
  atualizarColaborador,
  criarColaborador,
  excluirColaborador,
  getColaboradorCompleto,
  getColaboradoresCompletos,
} from '../../services/ColaboradorService';
import {
  atualizarDentista,
  criarDentista,
  excluirDentista,
  exportarDentistasCsv,
  getDentistaCompleto,
  getDentistasCompletos,
  registrarDentistaVoluntario,
} from '../../services/DentistaService';
import { getEspecialidadePorId, getEspecialidades } from '../../services/EspecialidadeService';
import {
  aprovarPedido,
  criarPedidoAjuda,
  excluirPedido,
  getPedidoCompleto,
  getPedidosCompletos,
  negarPedido,
} from '../../services/PedidoService';
import { getProgramasSociais } from '../../services/ProgramaService';
import { tokenStore } from '../../services/tokenStore';
import {
  atendimentoApi,
  beneficiarioApi,
  colaboradorApi,
  dentistaApi,
  pedidoApi,
} from '../../test/factories';
import { bodyOf, fakeResponse, installFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;

const ok = (body?: unknown, status = 200) => fakeResponse({ status, body });
const urlOf = (call = 0) => fetchMock.mock.calls[call][0];
const initOf = (call = 0) => fetchMock.mock.calls[call][1];

beforeEach(() => {
  tokenStore.clear();
  fetchMock = installFetch();
});

/* Listagens têm o mesmo contrato: 404/204 → [], corpo nulo → [] */
describe.each([
  ['atendimentos', '/atendimento', () => getAtendimentos()],
  ['beneficiários', '/beneficiario', () => getBeneficiariosCompletos()],
  ['colaboradores', '/colaborador', () => getColaboradoresCompletos()],
  ['dentistas', '/dentista', () => getDentistasCompletos()],
  ['especialidades', '/especialidades', () => getEspecialidades()],
  ['pedidos', '/pedido-ajuda', () => getPedidosCompletos()],
  ['programas sociais', '/programas-sociais', () => getProgramasSociais()],
])('listagem de %s', (_nome, endpoint, listar) => {
  it(`faz GET ${endpoint}`, async () => {
    fetchMock.mockResolvedValue(ok([]));
    await listar();
    expect(urlOf()).toBe(endpoint);
    expect(initOf()?.method).toBeUndefined();
  });

  it.each([404, 204])('status %i vira lista vazia', async (status) => {
    fetchMock.mockResolvedValue(fakeResponse({ status }));
    await expect(listar()).resolves.toEqual([]);
  });

  it('corpo vazio vira lista vazia', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, text: '' }));
    await expect(listar()).resolves.toEqual([]);
  });

  it('erro do servidor é propagado com a mensagem do back', async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ status: 500, body: { mensagem: 'Erro interno do servidor.' } }),
    );
    await expect(listar()).rejects.toThrow('Erro interno do servidor.');
  });
});

describe('AtendimentoService', () => {
  it('lista atendimentos devolvendo os dados da API', async () => {
    fetchMock.mockResolvedValue(ok([atendimentoApi({ id: 5 })]));
    const lista = await getAtendimentos();
    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe(5);
  });

  it('criarAtendimento faz POST com prontuário e CPF', async () => {
    fetchMock.mockResolvedValue(ok(atendimentoApi(), 201));
    await criarAtendimento({ prontuario: 'Dor', cpfBeneficiario: '123' });

    expect(urlOf()).toBe('/atendimento');
    expect(initOf()?.method).toBe('POST');
    expect(bodyOf(fetchMock)).toEqual({ prontuario: 'Dor', cpfBeneficiario: '123' });
  });

  it('getAtendimentoPorCpf devolve o atendimento, ou null em 404', async () => {
    fetchMock.mockResolvedValueOnce(ok(atendimentoApi({ id: 3 })));
    await expect(getAtendimentoPorCpf('123')).resolves.toMatchObject({ id: 3 });
    expect(urlOf()).toBe('/atendimento/123');

    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 404 }));
    await expect(getAtendimentoPorCpf('999')).resolves.toBeNull();
  });

  it('encerrarAtendimento faz PUT por CPF com prontuário e colaborador', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await encerrarAtendimento('123', { prontuario: 'ok', idColaborador: 7 });

    expect(urlOf()).toBe('/atendimento/123');
    expect(initOf()?.method).toBe('PUT');
    expect(bodyOf(fetchMock)).toEqual({ prontuario: 'ok', idColaborador: 7 });
  });

  it('excluirAtendimento faz DELETE por id', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await excluirAtendimento(4);

    expect(urlOf()).toBe('/atendimento/4');
    expect(initOf()?.method).toBe('DELETE');
  });

  it('exportarAtendimentosCsv devolve o blob e falha em erro', async () => {
    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, text: 'a;b' }));
    await expect(exportarAtendimentosCsv()).resolves.toBe('a;b');
    expect(urlOf()).toBe('/atendimento/exportarCsv');

    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 403, body: { mensagem: 'Sem permissão' } }));
    await expect(exportarAtendimentosCsv()).rejects.toThrow('Sem permissão');
  });
});

describe('Beneficiarioservice', () => {
  it('lista beneficiários já mapeados para view model', async () => {
    fetchMock.mockResolvedValue(ok([beneficiarioApi({ programaSocial: 'APOLONIA_DO_BEM' })]));
    const [b] = await getBeneficiariosCompletos();
    expect(b.programaSocial).toBe('Apolonia Do Bem');
    expect(b.dataNascimento).toBe('05/05/2010');
  });

  it('getBeneficiarioCompleto mapeia, e devolve null em 404', async () => {
    fetchMock.mockResolvedValueOnce(ok(beneficiarioApi()));
    await expect(getBeneficiarioCompleto('123')).resolves.toMatchObject({ nomeCompleto: 'Maria Silva' });
    expect(urlOf()).toBe('/beneficiario/123');

    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 404 }));
    await expect(getBeneficiarioCompleto('999')).resolves.toBeNull();
  });

  it('criarBeneficiario faz POST com pedido e programa', async () => {
    fetchMock.mockResolvedValue(ok(beneficiarioApi(), 201));
    const criado = await criarBeneficiario({ idPedidoAjuda: 9, idProgramaSocial: 2 });

    expect(initOf()?.method).toBe('POST');
    expect(bodyOf(fetchMock)).toEqual({ idPedidoAjuda: 9, idProgramaSocial: 2 });
    expect(criado.id).toBe(1);
  });

  it('atualizarBeneficiario faz PUT por CPF', async () => {
    fetchMock.mockResolvedValue(ok(beneficiarioApi()));
    await atualizarBeneficiario('123', { telefone: '11999999999' });

    expect(urlOf()).toBe('/beneficiario/123');
    expect(initOf()?.method).toBe('PUT');
    expect(bodyOf(fetchMock)).toEqual({ telefone: '11999999999' });
  });

  it('excluirBeneficiario faz DELETE por CPF', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await excluirBeneficiario('123');

    expect(urlOf()).toBe('/beneficiario/123');
    expect(initOf()?.method).toBe('DELETE');
  });

  it('exportarBeneficiariosCsv devolve o blob', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, text: 'csv' }));
    await expect(exportarBeneficiariosCsv()).resolves.toBe('csv');
    expect(urlOf()).toBe('/beneficiario/exportarCsv');
  });
});

describe('ColaboradorService', () => {
  it('lista colaboradores mapeando as datas', async () => {
    fetchMock.mockResolvedValue(ok([colaboradorApi()]));
    const [c] = await getColaboradoresCompletos();
    expect(c.dataContratacao).toBe('01/02/2020');
  });

  it('getColaboradorCompleto procura pelo id na listagem', async () => {
    fetchMock.mockResolvedValue(ok([colaboradorApi({ id: 1 }), colaboradorApi({ id: 2, nomeCompleto: 'Bia' })]));

    await expect(getColaboradorCompleto(2)).resolves.toMatchObject({ nomeCompleto: 'Bia' });
    await expect(getColaboradorCompleto(99)).resolves.toBeNull();
  });

  describe('atualizarColaborador', () => {
    it('204 devolve null', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
      await expect(atualizarColaborador('123', { email: 'n@x.com' })).resolves.toBeNull();
      expect(urlOf()).toBe('/colaborador/123');
      expect(initOf()?.method).toBe('PUT');
    });

    it('content-length 0 devolve null', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, headers: { 'content-length': '0' } }));
      await expect(atualizarColaborador('123', {})).resolves.toBeNull();
    });

    it('erro do back é propagado (não pode parecer sucesso)', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 409, body: { mensagem: 'E-mail em uso.' } }));
      await expect(atualizarColaborador('123', { email: 'x@y.com' })).rejects.toThrow('E-mail em uso.');
    });

    it('com corpo devolve o colaborador mapeado', async () => {
      fetchMock.mockResolvedValue(ok(colaboradorApi({ nomeCompleto: 'Atualizada' })));
      await expect(atualizarColaborador('123', {})).resolves.toMatchObject({ nomeCompleto: 'Atualizada' });
    });

    it('corpo vazio com 200 não quebra', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, text: '' }));
      await expect(atualizarColaborador('123', {})).resolves.toMatchObject({ nomeCompleto: '—' });
    });
  });

  it('excluirColaborador faz DELETE por CPF', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await excluirColaborador('123');
    expect(urlOf()).toBe('/colaborador/123');
    expect(initOf()?.method).toBe('DELETE');
  });

  it('criarColaborador faz POST e mapeia a resposta', async () => {
    fetchMock.mockResolvedValue(ok(colaboradorApi(), 201));
    const payload = {
      nomeCompleto: 'Ana',
      email: 'a@x.com',
      cpf: '123',
      dataNascimento: '1990-01-01',
      dataContratacao: '2020-01-01',
      role: 'ADMIN' as const,
      senha: 'Senha@123',
    };

    const criado = await criarColaborador(payload);

    expect(initOf()?.method).toBe('POST');
    expect(bodyOf(fetchMock)).toEqual(payload);
    expect(criado.email).toBe('ana@x.com');
  });
});

describe('DentistaService', () => {
  it('lista dentistas mapeados (telefone formatado, disponibilidade booleana)', async () => {
    fetchMock.mockResolvedValue(ok([dentistaApi()]));
    const [d] = await getDentistasCompletos();
    expect(d.telefone).toBe('(11) 98765-4321');
    expect(d.disponivel).toBe(true);
  });

  it('getDentistaCompleto mapeia, e devolve null em 404', async () => {
    fetchMock.mockResolvedValueOnce(ok(dentistaApi()));
    await expect(getDentistaCompleto('123')).resolves.toMatchObject({ croDentista: 'CRO-SP 12345' });
    expect(urlOf()).toBe('/dentista/123');

    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 404 }));
    await expect(getDentistaCompleto('999')).resolves.toBeNull();
  });

  const payload = {
    croDentista: 'CRO-SP 1',
    cpf: '12345678901',
    nomeCompleto: 'Dr. X',
    sexo: 'M' as const,
    email: 'x@x.com',
    telefone: '11987654321',
    categoria: 'CLINICO' as const,
    idEspecialidade: 2,
    disponivel: 'S' as const,
    endereco: { cep: '01001000', numero: '10' },
  };

  it('criarDentista faz POST autenticado', async () => {
    tokenStore.set('meu-token');
    fetchMock.mockResolvedValue(ok(dentistaApi(), 201));

    await criarDentista(payload);

    expect(urlOf()).toBe('/dentista');
    expect(initOf()?.method).toBe('POST');
    expect(bodyOf(fetchMock)).toEqual(payload);
    expect((initOf()?.headers as Record<string, string>).Authorization).toBe('Bearer meu-token');
  });

  it('registrarDentistaVoluntario faz POST público, sem Authorization', async () => {
    tokenStore.set('meu-token');
    fetchMock.mockResolvedValue(ok(dentistaApi(), 201));

    const criado = await registrarDentistaVoluntario(payload);

    expect(urlOf()).toBe('/dentista');
    expect(initOf()?.method).toBe('POST');
    expect(initOf()?.headers).not.toHaveProperty('Authorization');
    expect(criado.nomeCompleto).toBe('Dr. João');
  });

  it('registrarDentistaVoluntario propaga erro de validação do back', async () => {
    fetchMock.mockResolvedValue(
      fakeResponse({ status: 400, body: { mensagem: 'Especialidade é obrigatória.' } }),
    );
    await expect(registrarDentistaVoluntario(payload)).rejects.toThrow('Especialidade é obrigatória.');
  });

  it('atualizarDentista faz PUT por CPF', async () => {
    fetchMock.mockResolvedValue(ok(dentistaApi()));
    await atualizarDentista('123', { disponivel: 'N' });

    expect(urlOf()).toBe('/dentista/123');
    expect(initOf()?.method).toBe('PUT');
    expect(bodyOf(fetchMock)).toEqual({ disponivel: 'N' });
  });

  it('excluirDentista faz DELETE por CPF', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await excluirDentista('123');
    expect(initOf()?.method).toBe('DELETE');
  });

  it('exportarDentistasCsv devolve o blob', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, text: 'csv' }));
    await expect(exportarDentistasCsv()).resolves.toBe('csv');
    expect(urlOf()).toBe('/dentista/exportarCsv');
  });
});

describe('EspecialidadeService / ProgramaService', () => {
  it('getEspecialidades devolve a lista', async () => {
    fetchMock.mockResolvedValue(ok([{ id: 1, descricao: 'Ortodontia' }]));
    await expect(getEspecialidades()).resolves.toEqual([{ id: 1, descricao: 'Ortodontia' }]);
  });

  it('getEspecialidadePorId faz GET por id', async () => {
    fetchMock.mockResolvedValue(ok({ id: 3, descricao: 'Endodontia' }));
    await expect(getEspecialidadePorId(3)).resolves.toEqual({ id: 3, descricao: 'Endodontia' });
    expect(urlOf()).toBe('/especialidades/3');
  });

  it('getProgramasSociais devolve a lista', async () => {
    fetchMock.mockResolvedValue(ok([{ id: 1, programa: 'Dentista do Bem' }]));
    await expect(getProgramasSociais()).resolves.toHaveLength(1);
  });
});

describe('PedidoService', () => {
  it('lista pedidos mapeados', async () => {
    fetchMock.mockResolvedValue(ok([pedidoApi({ status: 'APROVADO' })]));
    const [p] = await getPedidosCompletos();
    expect(p.statusLabel).toBe('Aprovado');
    expect(p.cpf).toBe('123.456.789-01');
  });

  it('getPedidoCompleto procura pelo id na listagem (o back não tem GET por id)', async () => {
    fetchMock.mockResolvedValue(ok([pedidoApi({ id: 1 }), pedidoApi({ id: 2, nomeCompleto: 'Joana' })]));

    await expect(getPedidoCompleto(2)).resolves.toMatchObject({ nomeCompleto: 'Joana' });
    await expect(getPedidoCompleto(50)).resolves.toBeNull();
  });

  it('criarPedidoAjuda faz POST e mapeia a resposta', async () => {
    fetchMock.mockResolvedValue(ok(pedidoApi({ id: 10 }), 201));
    const payload = {
      cpf: '12345678901',
      nome: 'Maria',
      dataNascimento: '2010-05-05',
      sexo: 'F' as const,
      telefone: '11987654321',
      email: 'm@x.com',
      descricaoProblema: 'Dor',
      endereco: { cep: '01001000', numero: '10' },
    };

    const criado = await criarPedidoAjuda(payload);

    expect(initOf()?.method).toBe('POST');
    expect(bodyOf(fetchMock)).toEqual(payload);
    expect(criado.id).toBe(10);
  });

  it('aprovarPedido faz PUT com status APROVADO e o dentista', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await aprovarPedido(5, 8);

    expect(urlOf()).toBe('/pedido-ajuda/5');
    expect(initOf()?.method).toBe('PUT');
    expect(bodyOf(fetchMock)).toEqual({ statusPedido: 'APROVADO', idDentista: 8 });
  });

  it('negarPedido faz PUT com status REJEITADO', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await negarPedido(5, 8);

    expect(bodyOf(fetchMock)).toEqual({ statusPedido: 'REJEITADO', idDentista: 8 });
  });

  it('excluirPedido faz DELETE por id', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    await excluirPedido(5);

    expect(urlOf()).toBe('/pedido-ajuda/5');
    expect(initOf()?.method).toBe('DELETE');
  });
});
