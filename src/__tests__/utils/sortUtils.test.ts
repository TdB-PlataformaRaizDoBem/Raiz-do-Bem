import { describe, expect, it } from 'vitest';
import { comparadorPorData } from '../../utils/sortUtils';
import { caminhoDoPedido } from '../../utils/pedidoRoutes';

interface Item {
  id: number;
  data: string | null | undefined;
}

const item = (id: number, data: Item['data']): Item => ({ id, data });
const ids = (lista: Item[]) => lista.map((i) => i.id);

const lista = [
  item(1, '2026-03-10'),
  item(2, '2026-01-05'),
  item(3, '2026-03-10'),
  item(4, null),
  item(5, '2026-02-20'),
  item(6, ''),
  item(7, undefined),
];

describe('comparadorPorData', () => {
  it('"recentes" põe a data mais nova primeiro e desempata pelo id maior', () => {
    const ordenada = [...lista].sort(comparadorPorData<Item>((i) => i.data, (i) => i.id, 'recentes'));

    expect(ids(ordenada).slice(0, 4)).toEqual([3, 1, 5, 2]);
  });

  it('"antigos" põe a data mais velha primeiro e desempata pelo id menor', () => {
    const ordenada = [...lista].sort(comparadorPorData<Item>((i) => i.data, (i) => i.id, 'antigos'));

    expect(ids(ordenada).slice(0, 4)).toEqual([2, 5, 1, 3]);
  });

  it.each(['recentes', 'antigos'] as const)('datas vazias, nulas ou ausentes ficam sempre no fim (%s)', (sentido) => {
    const ordenada = [...lista].sort(comparadorPorData<Item>((i) => i.data, (i) => i.id, sentido));

    expect(ids(ordenada).slice(4).sort()).toEqual([4, 6, 7]);
  });

  it('ignora espaços ao decidir se a data está vazia', () => {
    const ordenada = [item(1, '   '), item(2, '2026-01-01')].sort(
      comparadorPorData<Item>((i) => i.data, (i) => i.id, 'recentes'),
    );

    expect(ids(ordenada)).toEqual([2, 1]);
  });

  it('não altera a lista original quando usado numa cópia', () => {
    const original = [item(1, '2026-01-01'), item(2, '2026-02-01')];
    [...original].sort(comparadorPorData<Item>((i) => i.data, (i) => i.id, 'recentes'));

    expect(ids(original)).toEqual([1, 2]);
  });
});

describe('caminhoDoPedido', () => {
  it('administrador vai para /admin com o id do pedido', () => {
    expect(caminhoDoPedido('ADMIN', 12)).toBe('/admin/solicitacoes?id=12');
  });

  it.each(['COLABORADOR', undefined] as const)('perfil %s vai para /coord', (role) => {
    expect(caminhoDoPedido(role, 7)).toBe('/coord/solicitacoes?id=7');
  });
});
