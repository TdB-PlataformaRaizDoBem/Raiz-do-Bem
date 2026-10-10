import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '../../components/ui/Pagination';

type Props = Partial<React.ComponentProps<typeof Pagination>>;

function renderPagination(props: Props = {}) {
  const onPageChange = vi.fn();
  render(
    <Pagination
      page={1}
      totalPages={3}
      totalItems={30}
      from={1}
      to={12}
      onPageChange={onPageChange}
      {...props}
    />,
  );
  return { onPageChange };
}

const nav = () => screen.getByRole('navigation', { name: 'Paginação' });
const numeros = () =>
  within(nav())
    .getAllByRole('button')
    .map((b) => b.textContent)
    .filter((t) => /^\d+$/.test(t ?? ''));

describe('Pagination', () => {
  it('mostra o resumo "Mostrando x–y de z"', () => {
    renderPagination({ from: 13, to: 24, page: 2 });

    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 13–24 de 30');
  });

  it('aparece mesmo com uma página só', () => {
    renderPagination({ totalPages: 1, totalItems: 5, from: 1, to: 5 });

    expect(nav()).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Mostrando 1–5 de 5');
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });

  it('não renderiza nada quando não há itens', () => {
    renderPagination({ totalItems: 0, totalPages: 1, from: 0, to: 0 });

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('marca a página atual com aria-current', () => {
    renderPagination({ page: 2 });

    expect(screen.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Página 1' })).not.toHaveAttribute('aria-current');
  });

  it('desabilita "Anterior" na primeira página e "Próxima" na última', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={3} totalItems={30} from={1} to={12} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeEnabled();

    rerender(
      <Pagination page={3} totalPages={3} totalItems={30} from={25} to={30} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
  });

  it('chama onPageChange ao clicar em Próxima, Anterior e em um número', async () => {
    const { onPageChange } = renderPagination({ page: 2 });

    await userEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    await userEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);

    await userEvent.click(screen.getByRole('button', { name: 'Página 3' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it('mostra todas as páginas quando são 7 ou menos', () => {
    renderPagination({ totalPages: 7, page: 4 });

    expect(numeros()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
  });

  it('com muitas páginas, usa reticências no começo', () => {
    renderPagination({ totalPages: 20, page: 2 });

    expect(numeros()).toEqual(['1', '2', '3', '20']);
    expect(nav().querySelectorAll('li[aria-hidden="true"]')).toHaveLength(1);
  });

  it('com muitas páginas, usa reticências nos dois lados no meio', () => {
    renderPagination({ totalPages: 20, page: 10 });

    expect(numeros()).toEqual(['1', '9', '10', '11', '20']);
    expect(nav().querySelectorAll('li[aria-hidden="true"]')).toHaveLength(2);
  });

  it('com muitas páginas, usa reticências no fim quando perto do final', () => {
    renderPagination({ totalPages: 20, page: 19 });

    expect(numeros()).toEqual(['1', '18', '19', '20']);
    expect(nav().querySelectorAll('li[aria-hidden="true"]')).toHaveLength(1);
  });
});
