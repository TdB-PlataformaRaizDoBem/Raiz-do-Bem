import { describe, expect, it } from 'vitest';
import type { DentistaAPI } from '../../domain/entities/DentistaAPI';
import {
  atendimentoApi,
  beneficiarioApi,
  colaboradorApi,
  dentistaApi,
  pedidoApi,
} from '../../test/factories';
import { ATENDIMENTO_EM_ABERTO, mapAtendimento, mapAtendimentos } from '../../domain/mappers/AtendimentoMapper';
import { mapBeneficiario, mapBeneficiarios } from '../../domain/mappers/Beneficiariomapper';
import { mapColaborador, mapColaboradores } from '../../domain/mappers/ColaboradorMapper';
import {
  isDentistaDisponivel,
  mapDentista,
  mapDentistas,
  programaCompativel,
} from '../../domain/mappers/DentistaMapper';
import {
  isPedidoAprovado,
  isPedidoPendente,
  isPedidoRejeitado,
  mapPedido,
  mapPedidos,
  STATUS_LABEL,
} from '../../domain/mappers/PedidoMapper';

/* ───────────── Atendimento ───────────── */

describe('mapAtendimento', () => {
  it('formata datas e telefone', () => {
    const vm = mapAtendimento(atendimentoApi({ dataFim: '2026-04-01' }));

    expect(vm).toMatchObject({
      id: 1,
      dataInicial: '09/03/2026',
      dataInicialISO: '2026-03-09',
      dataFim: '01/04/2026',
      dataFimISO: '2026-04-01',
      contatoDentista: '(11) 98765-4321',
      encerrado: true,
    });
  });

  it('atendimento "NÃO FINALIZADO" está em aberto', () => {
    const vm = mapAtendimento(atendimentoApi({ dataFim: ATENDIMENTO_EM_ABERTO }));

    expect(vm.encerrado).toBe(false);
    expect(vm.dataFim).toBe('');
    expect(vm.dataFimISO).toBeNull();
  });

  it.each([null, '', '   '])('dataFim %p conta como em aberto', (dataFim) => {
    const vm = mapAtendimento(atendimentoApi({ dataFim: dataFim as string }));
    expect(vm.encerrado).toBe(false);
  });

  it('usa "—" para campos nulos', () => {
    const vm = mapAtendimento(
      atendimentoApi({ prontuario: null, beneficiario: null, dentista: null, dataInicial: null }),
    );

    expect(vm).toMatchObject({
      prontuario: '—',
      beneficiario: '—',
      dentista: '—',
      dataInicial: '—',
      dataInicialISO: null,
    });
  });

  it('mapAtendimentos mapeia a lista', () => {
    expect(mapAtendimentos([atendimentoApi({ id: 1 }), atendimentoApi({ id: 2 })])).toHaveLength(2);
    expect(mapAtendimentos([])).toEqual([]);
  });
});

/* ───────────── Beneficiário ───────────── */

describe('mapBeneficiario', () => {
  it('formata programa social, data e preserva as relações', () => {
    const vm = mapBeneficiario(beneficiarioApi());

    expect(vm).toMatchObject({
      id: 1,
      cpf: '12345678901',
      nomeCompleto: 'Maria Silva',
      dataNascimento: '05/05/2010',
      programaSocial: 'Dentista Do Bem',
      pedido: { id: 9, dentistaResponsavel: 'Dr. João' },
    });
    expect(vm.endereco).toMatchObject({ cidade: 'São Paulo', estado: 'SP', cep: '01001000' });
  });

  it('sem endereço e sem pedido devolve null', () => {
    const vm = mapBeneficiario(beneficiarioApi({ endereco: null, pedido: null }));

    expect(vm.endereco).toBeNull();
    expect(vm.pedido).toBeNull();
  });

  it('aplica valores padrão no endereço', () => {
    const vm = mapBeneficiario(
      beneficiarioApi({
        endereco: {
          id: 1,
          logradouro: null as unknown as string,
          cep: null as unknown as string,
          numero: null as unknown as string,
          bairro: null,
          cidade: null as unknown as string,
          estado: null as unknown as string,
          tipoEndereco: null,
        },
      }),
    );

    expect(vm.endereco).toEqual({
      id: 1,
      tipoEndereco: 'RESIDENCIAL',
      logradouro: '—',
      numero: 'S/N',
      bairro: '—',
      cidade: '—',
      estado: '—',
      cep: '—',
    });
  });

  it('dentistaResponsavel ausente no pedido vira null', () => {
    const vm = mapBeneficiario(
      beneficiarioApi({ pedido: { id: 1, dentistaResponsavel: undefined as unknown as string } }),
    );
    expect(vm.pedido?.dentistaResponsavel).toBeNull();
  });

  it('não quebra quando o back devolve programaSocial nulo ou vazio', () => {
    expect(mapBeneficiario(beneficiarioApi({ programaSocial: null })).programaSocial).toBeNull();
    expect(mapBeneficiario(beneficiarioApi({ programaSocial: '' })).programaSocial).toBeNull();
  });

  it('um beneficiário sem programa não derruba o mapeamento da lista inteira', () => {
    const lista = mapBeneficiarios([
      beneficiarioApi({ id: 1, programaSocial: null }),
      beneficiarioApi({ id: 2, programaSocial: 'APOLONIA_DO_BEM' }),
    ]);

    expect(lista.map((b) => b.programaSocial)).toEqual([null, 'Apolonia Do Bem']);
  });

  it('campos de texto nulos viram "—"', () => {
    const vm = mapBeneficiario(
      beneficiarioApi({
        cpf: null as unknown as string,
        nomeCompleto: null as unknown as string,
        telefone: null as unknown as string,
        email: null as unknown as string,
      }),
    );

    expect(vm).toMatchObject({ cpf: '—', nomeCompleto: '—', telefone: '—', email: '—' });
  });

  it('mapBeneficiarios mapeia a lista', () => {
    expect(mapBeneficiarios([beneficiarioApi(), beneficiarioApi({ id: 2 })])).toHaveLength(2);
  });
});

/* ───────────── Colaborador ───────────── */

describe('mapColaborador', () => {
  it('formata as datas', () => {
    expect(mapColaborador(colaboradorApi())).toEqual({
      id: 1,
      cpf: '12345678901',
      nomeCompleto: 'Ana Admin',
      dataNascimento: '31/01/1990',
      dataContratacao: '01/02/2020',
      email: 'ana@x.com',
    });
  });

  it('não expõe a role nem a senha no view model', () => {
    const vm = mapColaborador(colaboradorApi({ role: 'ADMIN' }));
    expect(vm).not.toHaveProperty('role');
    expect(vm).not.toHaveProperty('senha');
  });

  it('usa "—" para nome/email nulos e datas ausentes', () => {
    const vm = mapColaborador(
      colaboradorApi({
        nomeCompleto: null as unknown as string,
        email: null as unknown as string,
        dataNascimento: null as unknown as string,
      }),
    );

    expect(vm).toMatchObject({ nomeCompleto: '—', email: '—', dataNascimento: '—' });
  });

  it('mapColaboradores mapeia a lista', () => {
    expect(mapColaboradores([colaboradorApi(), colaboradorApi({ id: 2 })])).toHaveLength(2);
  });
});

/* ───────────── Dentista ───────────── */

describe('mapDentista', () => {
  it('converte disponibilidade "S"/"N" e rótulos', () => {
    expect(mapDentista(dentistaApi({ disponivel: 'S' }))).toMatchObject({
      disponivel: true,
      disponibilidadeLabel: 'Sim',
    });
    expect(mapDentista(dentistaApi({ disponivel: 'N' }))).toMatchObject({
      disponivel: false,
      disponibilidadeLabel: 'Não',
    });
  });

  it.each([
    ['M', 'Masculino'],
    ['F', 'Feminino'],
    ['O', 'Outro'],
  ])('sexo %s → %s', (sexo, label) => {
    expect(mapDentista(dentistaApi({ sexo })).sexoLabel).toBe(label);
  });

  it('formata telefone e CEP', () => {
    const vm = mapDentista(dentistaApi());
    expect(vm.telefone).toBe('(11) 98765-4321');
    expect(vm.cep).toBe('01001-000');
  });

  it('CEP ausente vira null', () => {
    expect(mapDentista(dentistaApi({ cep: null })).cep).toBeNull();
  });

  it('programa vem do primeiro programa social formatado', () => {
    expect(mapDentista(dentistaApi({ programasSociais: ['DENTISTA_DO_BEM', 'APOLONIA'] })).programa).toBe(
      'Dentista Do Bem',
    );
  });

  it('sem programas sociais usa a categoria, e sem categoria "Não informado"', () => {
    expect(mapDentista(dentistaApi({ programasSociais: [], categoria: 'CLINICO' })).programa).toBe(
      'CLINICO',
    );
    expect(mapDentista(dentistaApi({ programasSociais: [], categoria: null })).programa).toBe(
      'Não informado',
    );
  });

  it('listas ausentes viram []', () => {
    const vm = mapDentista(
      dentistaApi({
        programasSociais: undefined as unknown as string[],
        especialidades: undefined as unknown as string[],
      }),
    );
    expect(vm.programasSociais).toEqual([]);
    expect(vm.especialidades).toEqual([]);
  });

  it('mapDentistas mapeia a lista', () => {
    expect(mapDentistas([dentistaApi(), dentistaApi({ id: 2 })])).toHaveLength(2);
  });
});

describe('isDentistaDisponivel / programaCompativel', () => {
  const vm = (o: Partial<DentistaAPI> = {}) => mapDentista(dentistaApi(o));

  it('isDentistaDisponivel reflete a disponibilidade', () => {
    expect(isDentistaDisponivel(vm({ disponivel: 'S' }))).toBe(true);
    expect(isDentistaDisponivel(vm({ disponivel: 'N' }))).toBe(false);
  });

  it('"Não informado" é compatível com qualquer programa', () => {
    const d = vm({ programasSociais: [], categoria: null });
    expect(programaCompativel(d, 'Dentista Do Bem')).toBe(true);
  });

  it('"Ambos" é compatível com qualquer programa', () => {
    const d = vm({ programasSociais: ['AMBOS'] });
    expect(programaCompativel(d, 'Apolonia')).toBe(true);
  });

  it('só é compatível com o mesmo programa do beneficiário', () => {
    const d = vm({ programasSociais: ['DENTISTA_DO_BEM'] });
    expect(programaCompativel(d, 'Dentista Do Bem')).toBe(true);
    expect(programaCompativel(d, 'Apolonia')).toBe(false);
  });
});

/* ───────────── Pedido de ajuda ───────────── */

describe('mapPedido', () => {
  it('formata CPF, telefone e datas', () => {
    expect(mapPedido(pedidoApi())).toMatchObject({
      cpf: '123.456.789-01',
      telefone: '(11) 98765-4321',
      dataNascimento: '05/05/2010',
      dataPedido: '09/03/2026',
      dataPedidoISO: '2026-03-09',
      sexoLabel: 'Feminino',
    });
  });

  it.each([
    ['PENDENTE', 'Pendente'],
    ['APROVADO', 'Aprovado'],
    ['REJEITADO', 'Negado'],
  ] as const)('status %s tem rótulo "%s" e classe própria', (status, label) => {
    const vm = mapPedido(pedidoApi({ status }));
    expect(vm.statusAPI).toBe(status);
    expect(vm.statusLabel).toBe(label);
    expect(vm.statusClass).not.toBe('');
    expect(STATUS_LABEL[status]).toBe(label);
  });

  it('status ausente assume PENDENTE', () => {
    expect(mapPedido(pedidoApi({ status: undefined as never })).statusAPI).toBe('PENDENTE');
  });

  it('status desconhecido recebe rótulo "Desconhecido"', () => {
    const vm = mapPedido(pedidoApi({ status: 'XYZ' as never }));
    expect(vm.statusLabel).toBe('Desconhecido');
    expect(vm.statusClass).toBe('');
  });

  it('preenche valores padrão para campos ausentes', () => {
    const vm = mapPedido(
      pedidoApi({
        nomeCompleto: null as unknown as string,
        descricaoProblema: null as unknown as string,
        dataNascimento: null,
        sexo: null,
        dataPedido: null as unknown as string,
        endereco: null as unknown as string,
        dentistaResponsavel: undefined,
      }),
    );

    expect(vm).toMatchObject({
      nomeCompleto: '—',
      descricaoProblema: 'Sem descrição informada.',
      dataNascimento: '—',
      sexoLabel: '—',
      dataPedido: '—',
      dataPedidoISO: '',
      endereco: null,
      dentistaResponsavel: null,
    });
  });

  it('predicados de status', () => {
    const pendente = mapPedido(pedidoApi({ status: 'PENDENTE' }));
    const aprovado = mapPedido(pedidoApi({ status: 'APROVADO' }));
    const rejeitado = mapPedido(pedidoApi({ status: 'REJEITADO' }));

    expect([isPedidoPendente(pendente), isPedidoAprovado(pendente), isPedidoRejeitado(pendente)]).toEqual([
      true,
      false,
      false,
    ]);
    expect(isPedidoAprovado(aprovado)).toBe(true);
    expect(isPedidoRejeitado(rejeitado)).toBe(true);
  });

  it('mapPedidos mapeia a lista', () => {
    expect(mapPedidos([pedidoApi(), pedidoApi({ id: 2 })])).toHaveLength(2);
  });
});
