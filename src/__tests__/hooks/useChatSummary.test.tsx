import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatSummary } from '../../hooks/useChatSummary';
import { summarizeChat } from '../../services/ChatService';

vi.mock('../../services/ChatService', () => ({ summarizeChat: vi.fn() }));

const TEL = '+5511977776666';
const resumo = { tel_client: TEL, necessidade_principal: 'A', status_atual: 'B', proximos_passos: 'C', messages_used: 2 };

beforeEach(() => {
  vi.mocked(summarizeChat).mockReset();
});

describe('useChatSummary', () => {
  it('começa ocioso', () => {
    const { result } = renderHook(() => useChatSummary(TEL));

    expect(result.current.state).toEqual({ status: 'idle' });
  });

  it('gera o resumo: carregando e depois pronto', async () => {
    vi.mocked(summarizeChat).mockResolvedValue(resumo);
    const { result } = renderHook(() => useChatSummary(TEL));

    act(() => void result.current.generate());

    expect(result.current.state.status).toBe('loading');
    await waitFor(() => expect(result.current.state).toEqual({ status: 'success', summary: resumo }));
  });

  it('erro do serviço mostra a mensagem dele', async () => {
    vi.mocked(summarizeChat).mockRejectedValue(new Error('IA fora do ar'));
    const { result } = renderHook(() => useChatSummary(TEL));

    await act(async () => result.current.generate());

    expect(result.current.state).toEqual({ status: 'error', message: 'IA fora do ar' });
  });

  it('falha que não é um Error usa a mensagem padrão', async () => {
    vi.mocked(summarizeChat).mockRejectedValue('quebrou');
    const { result } = renderHook(() => useChatSummary(TEL));

    await act(async () => result.current.generate());

    expect(result.current.state).toEqual({
      status: 'error',
      message: 'Não foi possível gerar o resumo agora.',
    });
  });

  it('o resumo é do contato: trocar de telefone volta a ocioso', async () => {
    vi.mocked(summarizeChat).mockResolvedValue(resumo);
    const { result, rerender } = renderHook(({ tel }) => useChatSummary(tel), { initialProps: { tel: TEL } });
    await act(async () => result.current.generate());

    rerender({ tel: '+5511900000000' });

    expect(result.current.state).toEqual({ status: 'idle' });
  });
});
