import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ChatWindow } from '../../components/chat/Chatwindow';

const renderChat = () => {
  const onSend = vi.fn<(texto: string) => Promise<void>>(async () => {});
  render(
    <ChatWindow
      telefone="11987654321"
      messages={[]}
      loading={false}
      sending={false}
      error={null}
      onSend={onSend}
      onClearError={() => {}}
      onOpenSidebar={() => {}}
    />,
  );
  return onSend;
};

describe('ChatWindow — mensagem só com espaços', () => {
  it('Enter com o campo em branco (só espaços) não envia nada', async () => {
    const onSend = renderChat();

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), '   {Enter}');

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeDisabled();
  });

  it('Shift+Enter quebra linha em vez de enviar', async () => {
    const onSend = renderChat();

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), 'oi{Shift>}{Enter}{/Shift}tudo bem');

    expect(onSend).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('oi\ntudo bem');
  });

  it('texto com espaços nas pontas é enviado aparado', async () => {
    const onSend = renderChat();

    await userEvent.type(screen.getByPlaceholderText('Digite uma mensagem'), '  oi  {Enter}');

    expect(onSend).toHaveBeenCalledWith('oi');
  });
});
