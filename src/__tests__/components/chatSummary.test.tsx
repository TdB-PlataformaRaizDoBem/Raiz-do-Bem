import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '../../components/chat/Chatwindow';
import { useChatSummaryPanel } from '../../hooks/useChatSummaryPanel';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;
const CHAT = 'http://localhost:8000';
const TEL = '+5511977776666';

beforeEach(() => {
  fetchMock = installFetch();
});

const resumo = {
  tel_client: TEL,
  necessidade_principal: 'Tratamento de canal para a filha, de 9 anos.',
  status_atual: 'Documentos pedidos; falta o comprovante de residência.',
  proximos_passos: '- Aguardar o comprovante\n- Finalizar a inscrição\n- Agendar a consulta',
  messages_used: 35,
};

/** Chat completo com o assistente de resumo, como nas telas de conversa. */
function Chat({ telefone = TEL }: { telefone?: string }) {
  const summary = useChatSummaryPanel(telefone);
  return (
    <ChatWindow
      telefone={telefone}
      messages={[]}
      loading={false}
      sending={false}
      error={null}
      onSend={async () => {}}
      onClearError={() => {}}
      onOpenSidebar={() => {}}
      summary={summary}
    />
  );
}

const gatilho = () => screen.getByRole('button', { name: 'Resumo do atendimento por IA' });

describe('Resumo por IA (assistente lateral)', () => {
  it('fica escondido até clicar no brilho e não chama a IA antes disso', () => {
    render(<Chat />);

    expect(gatilho()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('complementary', { name: 'Resumo do atendimento' })).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('um clique abre o painel lateral e já gera o resumo', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: resumo }));
    render(<Chat />);

    await userEvent.click(gatilho());

    expect(await screen.findByText('Tratamento de canal para a filha, de 9 anos.')).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Resumo do atendimento' })).toBeInTheDocument();
    expect(gatilho()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Necessidade Principal')).toBeInTheDocument();
    expect(screen.getByText('Status Atual')).toBeInTheDocument();
    expect(screen.getByText('Próximos Passos')).toBeInTheDocument();
    expect(screen.getByText(/últimas 35 mensagens/)).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe(`${CHAT}/api/chats/%2B5511977776666/summarize`);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('mostra os próximos passos como lista', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: resumo }));
    render(<Chat />);

    await userEvent.click(gatilho());

    const itens = await screen.findAllByRole('listitem');
    expect(itens.map((li) => li.textContent)).toEqual([
      'Aguardar o comprovante',
      'Finalizar a inscrição',
      'Agendar a consulta',
    ]);
  });

  it('enquanto a IA lê a conversa mostra o carregamento', async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<Chat />);

    await userEvent.click(gatilho());

    expect(await screen.findByRole('status', { name: 'Gerando resumo' })).toBeInTheDocument();
  });

  it('mostra erro amigável quando a IA falha e permite tentar de novo', async () => {
    fetchMock.mockResolvedValueOnce(
      fakeResponse({ status: 502, body: { detail: 'Não foi possível gerar o resumo agora. Consulte o histórico normalmente.' } }),
    );
    render(<Chat />);

    await userEvent.click(gatilho());

    expect(await screen.findByRole('alert')).toHaveTextContent('Consulte o histórico normalmente');

    fetchMock.mockResolvedValueOnce(fakeResponse({ status: 200, body: resumo }));
    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Status Atual')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('Esc e o botão Fechar escondem o painel; reabrir não gera de novo', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: resumo }));
    render(<Chat />);
    await userEvent.click(gatilho());
    await screen.findByText('Status Atual');

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('complementary', { name: 'Resumo do atendimento' })).not.toBeInTheDocument();

    await userEvent.click(gatilho());
    expect(await screen.findByText('Status Atual')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Fechar resumo' }));
    expect(screen.queryByRole('complementary', { name: 'Resumo do atendimento' })).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('descarta e fecha o resumo ao trocar de conversa', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: resumo }));
    const { rerender } = render(<Chat />);
    await userEvent.click(gatilho());
    await screen.findByText('Status Atual');

    rerender(<Chat telefone="+5511900000000" />);

    expect(screen.queryByText('Status Atual')).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'Resumo do atendimento' })).not.toBeInTheDocument();
  });
});
