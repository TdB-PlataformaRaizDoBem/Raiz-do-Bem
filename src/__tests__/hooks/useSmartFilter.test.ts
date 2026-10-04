import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import type { PageFilterConfig } from '../../components/UserManagement/FilterConfig';
import type { BeneficiarioViewModel } from '../../domain/mappers/Beneficiariomapper';
import type { DentistaViewModel } from '../../domain/mappers/DentistaMapper';
import type { PedidoViewModel } from '../../domain/mappers/PedidoMapper';
import {
  beneficiarioFilterConfig,
  dentistaFilterConfig,
  pedidoFilterConfig,
} from '../../hooks/pageFilterConfigs';
import { normalizeText, useSmartFilter } from '../../hooks/useSmartFilter';

interface Item {
  nome: string;
  tipo: string;
}

const itens: Item[] = [
  { nome: 'João Silva', tipo: 'a' },
  { nome: 'Maria Souza', tipo: 'b' },
  { nome: 'José Silva', tipo: 'a' },
];

const config: PageFilterConfig<Item> = {
  groups: [{ label: 'Tipo', key: 'tipo', options: [{ label: 'A', value: 'a' }] }],
  predicate: (item, filtros, busca) =>
    (!filtros.tipo || item.tipo === filtros.tipo) &&
    (!busca || normalizeText(item.nome).includes(busca)),
};

describe('normalizeText', () => {
  it('remove acentos, espaços nas pontas e deixa minúsculo', () => {
    expect(normalizeText('  Conceição  ')).toBe('conceicao');
  });
});

describe('useSmartFilter', () => {
  it('sem filtros devolve tudo', () => {
    const { result } = renderHook(() => useSmartFilter(itens, config));

    expect(result.current.filteredItems).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('busca ignora acentos e caixa', () => {
    const { result } = renderHook(() => useSmartFilter(itens, config));

    act(() => result.current.setSearchText('JOSE'));

    expect(result.current.filteredItems.map((i) => i.nome)).toEqual(['José Silva']);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('toggleFilter ativa, e clicar de novo no mesmo valor desativa', () => {
    const { result } = renderHook(() => useSmartFilter(itens, config));

    act(() => result.current.toggleFilter('tipo', 'a'));
    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.activeFilters.tipo).toBe('a');

    act(() => result.current.toggleFilter('tipo', 'a'));
    expect(result.current.filteredItems).toHaveLength(3);
    expect(result.current.activeFilters.tipo).toBe('');
  });

  it('combina busca e filtro', () => {
    const { result } = renderHook(() => useSmartFilter(itens, config));

    act(() => {
      result.current.toggleFilter('tipo', 'a');
      result.current.setSearchText('silva');
    });

    expect(result.current.filteredItems).toHaveLength(2);

    act(() => result.current.setSearchText('joao'));
    expect(result.current.filteredItems.map((i) => i.nome)).toEqual(['João Silva']);
  });

  it('clearAll limpa busca e filtros', () => {
    const { result } = renderHook(() => useSmartFilter(itens, config));
    act(() => {
      result.current.toggleFilter('tipo', 'b');
      result.current.setSearchText('maria');
    });

    act(() => result.current.clearAll());

    expect(result.current.searchText).toBe('');
    expect(result.current.activeFilters.tipo).toBe('');
    expect(result.current.filteredItems).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
  });
});

describe('pageFilterConfigs', () => {
  const benef = (o: Partial<BeneficiarioViewModel>) =>
    ({
      nomeCompleto: 'Maria',
      cpf: '111',
      email: 'm@x.com',
      programaSocial: 'Dentista Do Bem',
      endereco: { cidade: 'São Paulo', estado: 'SP' },
      ...o,
    }) as BeneficiarioViewModel;

  it('beneficiários: busca por cidade ignorando acento', () => {
    const p = beneficiarioFilterConfig.predicate;
    expect(p(benef({}), {}, normalizeText('sao paulo'))).toBe(true);
    expect(p(benef({}), {}, normalizeText('curitiba'))).toBe(false);
  });

  it('beneficiários: filtro de programa compara sem acento/caixa', () => {
    const p = beneficiarioFilterConfig.predicate;
    const apolonia = benef({ programaSocial: 'Apolônia do Bem' });

    expect(p(apolonia, { programa: 'Apolonia do Bem' }, '')).toBe(true);
    expect(p(benef({}), { programa: 'Apolonia do Bem' }, '')).toBe(false);
  });

  const dent = (o: Partial<DentistaViewModel>) =>
    ({
      nomeCompleto: 'Dr. João',
      croDentista: 'CRO 1',
      cpf: '222',
      especialidades: ['Ortodontia'],
      cidade: 'Campinas',
      estado: 'SP',
      disponivel: true,
      programa: 'Dentista Do Bem',
      ...o,
    }) as DentistaViewModel;

  it('dentistas: filtro de disponibilidade', () => {
    const p = dentistaFilterConfig.predicate;

    expect(p(dent({ disponivel: true }), { disponivel: 'sim' }, '')).toBe(true);
    expect(p(dent({ disponivel: false }), { disponivel: 'sim' }, '')).toBe(false);
    expect(p(dent({ disponivel: false }), { disponivel: 'nao' }, '')).toBe(true);
    expect(p(dent({ disponivel: true }), { disponivel: 'nao' }, '')).toBe(false);
  });

  it('dentistas: busca por especialidade', () => {
    expect(dentistaFilterConfig.predicate(dent({}), {}, 'ortodontia')).toBe(true);
    expect(dentistaFilterConfig.predicate(dent({}), {}, 'implante')).toBe(false);
  });

  const pedido = (o: Partial<PedidoViewModel>) =>
    ({
      id: 7,
      nomeCompleto: 'Maria',
      cpf: '333',
      descricaoProblema: 'Dor de dente',
      endereco: 'Rua A',
      statusAPI: 'PENDENTE',
      dentistaResponsavel: null,
      ...o,
    }) as PedidoViewModel;

  it('pedidos: filtra por status e por dentista vinculado', () => {
    const p = pedidoFilterConfig.predicate;

    expect(p(pedido({}), { status: 'PENDENTE' }, '')).toBe(true);
    expect(p(pedido({}), { status: 'APROVADO' }, '')).toBe(false);
    expect(p(pedido({}), { dentista: 'sem' }, '')).toBe(true);
    expect(p(pedido({}), { dentista: 'com' }, '')).toBe(false);
    expect(p(pedido({ dentistaResponsavel: 'Dr. X' }), { dentista: 'com' }, '')).toBe(true);
  });

  it('pedidos: a busca encontra pelo número do protocolo', () => {
    expect(pedidoFilterConfig.predicate(pedido({ id: 4321 }), {}, '4321')).toBe(true);
  });
});
