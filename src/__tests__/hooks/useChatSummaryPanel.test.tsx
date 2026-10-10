import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useChatSummaryPanel } from '../../hooks/useChatSummaryPanel';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;
const TEL = '+5511977776666';

const resumo = {
  tel_client: TEL,
  necessidade_principal: 'A',
  status_atual: 'B',
  proximos_passos: 'C',
  messages_used: 3,
};

beforeEach(() => {
  fetchMock = installFetch();
  fetchMock.mockImplementation(async () => fakeResponse({ status: 200, body: resumo }));
});

const montar = (telefone = TEL) =>
  renderHook(({ telefone }) => useChatSummaryPanel(telefone), { initialProps: { telefone } });

describe('useChatSummaryPanel', () => {
  it('começa fechado e ocioso, sem chamar a IA', () => {
    const { result } = montar();

    expect(result.current.open).toBe(false);
    expect(result.current.state.status).toBe('idle');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('abrir gera o resumo na primeira vez', async () => {
    const { result } = montar();

    act(() => result.current.toggle());

    expect(result.current.open).toBe(true);
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('o mesmo botão fecha o painel quando ele está aberto', async () => {
    const { result } = montar();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state.status).toBe('success'));

    act(() => result.current.toggle());

    expect(result.current.open).toBe(false);
  });

  it('reabrir um resumo já pronto não chama a IA de novo', async () => {
    const { result } = montar();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state.status).toBe('success'));
    act(() => result.current.toggle());

    act(() => result.current.toggle());

    expect(result.current.open).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('close fecha sem mexer no resumo', async () => {
    const { result } = montar();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state.status).toBe('success'));

    act(() => result.current.close());

    expect(result.current.open).toBe(false);
    expect(result.current.state.status).toBe('success');
  });

  it('trocar de conversa fecha o painel e descarta o resumo do contato anterior', async () => {
    const { result, rerender } = montar();
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state.status).toBe('success'));

    rerender({ telefone: '+5511900000000' });

    expect(result.current.open).toBe(false);
    expect(result.current.state.status).toBe('idle');
  });
});
