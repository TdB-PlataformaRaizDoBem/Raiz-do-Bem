import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatWindow } from '../../components/chat/Chatwindow';

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onresult: ((event: unknown) => void) | null = null;
  start = vi.fn(() => this.onstart?.());
  stop = vi.fn();
  abort = vi.fn();

  constructor() {
    FakeRecognition.instances.push(this);
  }

  /** Simula o navegador entregando uma frase reconhecida. */
  say(transcript: string) {
    this.onresult?.({ results: [[{ transcript, confidence: 0.9 }]], resultIndex: 0 });
  }
}

const renderChat = (onSend = vi.fn<(texto: string) => Promise<void>>(async () => {})) => {
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

beforeEach(() => {
  FakeRecognition.instances = [];
});

afterEach(() => {
  Reflect.deleteProperty(window, 'webkitSpeechRecognition');
  Reflect.deleteProperty(window, 'SpeechRecognition');
});

describe('Ditado por voz no campo de mensagem', () => {
  it('sem suporte do navegador, o botão de microfone não aparece', () => {
    renderChat();

    expect(screen.queryByRole('button', { name: 'Ditar mensagem por voz' })).not.toBeInTheDocument();
  });

  describe('com suporte', () => {
    beforeEach(() => {
      Object.assign(window, { webkitSpeechRecognition: FakeRecognition });
    });

    it('escuta em pt-BR e mostra "Ouvindo..." enquanto o microfone está ativo', async () => {
      renderChat();

      await userEvent.click(screen.getByRole('button', { name: 'Ditar mensagem por voz' }));

      expect(FakeRecognition.instances[0].lang).toBe('pt-BR');
      expect(FakeRecognition.instances[0].start).toHaveBeenCalled();
      expect(screen.getByPlaceholderText('Ouvindo...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Parar ditado por voz' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('coloca a frase ditada no campo e habilita o envio', async () => {
      const onSend = renderChat();
      await userEvent.click(screen.getByRole('button', { name: 'Ditar mensagem por voz' }));

      act(() => FakeRecognition.instances[0].say('olá, tudo bem?'));

      expect(screen.getByRole('textbox')).toHaveValue('olá, tudo bem?');
      await userEvent.click(screen.getByRole('button', { name: 'Enviar mensagem' }));
      expect(onSend).toHaveBeenCalledWith('olá, tudo bem?');
    });

    it('acrescenta ao que já foi digitado, sem apagar o rascunho', async () => {
      renderChat();
      await userEvent.type(screen.getByRole('textbox'), 'Bom dia!');
      await userEvent.click(screen.getByRole('button', { name: 'Ditar mensagem por voz' }));

      act(() => FakeRecognition.instances[0].say('como posso ajudar'));

      expect(screen.getByRole('textbox')).toHaveValue('Bom dia! como posso ajudar');
    });
  });
});
