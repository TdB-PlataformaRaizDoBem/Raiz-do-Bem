import type { AtendimentoAPI } from '../domain/entities/AtendimentoAPI';
import type { BeneficiarioAPI } from '../domain/entities/BeneficiarioAPI';
import type { ColaboradorAPI } from '../domain/entities/ColaboradorAPI';
import type { DentistaAPI } from '../domain/entities/DentistaAPI';
import type { PedidoAjudaAPI } from '../domain/entities/PedidoAjudaAPI';

/** Fábricas de respostas da API (formato do back) para uso nos testes. */

export const ATENDIMENTO_EM_ABERTO_API = 'NÃO FINALIZADO';

export const atendimentoApi = (o: Partial<AtendimentoAPI> = {}): AtendimentoAPI => ({
  id: 1,
  prontuario: 'Dor de dente',
  beneficiario: 'Maria Silva',
  dentista: 'Dr. João',
  dataInicial: '2026-03-09',
  dataFim: ATENDIMENTO_EM_ABERTO_API,
  contatoDentista: '11987654321',
  emailDentista: 'joao@x.com',
  enderecoDentista: 'Rua A, 10',
  ...o,
});

export const beneficiarioApi = (o: Partial<BeneficiarioAPI> = {}): BeneficiarioAPI => ({
  id: 1,
  cpf: '12345678901',
  nomeCompleto: 'Maria Silva',
  dataNascimento: '2010-05-05',
  telefone: '11987654321',
  email: 'maria@x.com',
  programaSocial: 'DENTISTA_DO_BEM',
  pedido: { id: 9, dentistaResponsavel: 'Dr. João' },
  endereco: {
    id: 3,
    logradouro: 'Rua A',
    cep: '01001000',
    numero: '10',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    tipoEndereco: 'RESIDENCIAL',
  },
  ...o,
});

export const colaboradorApi = (o: Partial<ColaboradorAPI> = {}): ColaboradorAPI => ({
  id: 1,
  cpf: '12345678901',
  nomeCompleto: 'Ana Admin',
  dataNascimento: '1990-01-31',
  dataContratacao: '2020-02-01',
  email: 'ana@x.com',
  ...o,
});

export const dentistaApi = (o: Partial<DentistaAPI> = {}): DentistaAPI => ({
  id: 1,
  croDentista: 'CRO-SP 12345',
  cpf: '12345678901',
  nomeCompleto: 'Dr. João',
  sexo: 'M',
  email: 'joao@x.com',
  telefone: '11987654321',
  categoria: 'CLINICO',
  disponivel: 'S',
  especialidades: ['Ortodontia'],
  programasSociais: ['DENTISTA_DO_BEM'],
  cep: '01001000',
  logradouro: 'Rua A',
  numero: '10',
  cidade: 'São Paulo',
  estado: 'SP',
  ...o,
});

export const pedidoApi = (o: Partial<PedidoAjudaAPI> = {}): PedidoAjudaAPI => ({
  id: 1,
  cpf: '12345678901',
  nomeCompleto: 'Maria Silva',
  dataNascimento: '2010-05-05',
  sexo: 'F',
  telefone: '11987654321',
  email: 'maria@x.com',
  descricaoProblema: 'Dor',
  dataPedido: '2026-03-09',
  status: 'PENDENTE',
  endereco: 'Rua A, 10',
  dentistaResponsavel: null,
  ...o,
});
