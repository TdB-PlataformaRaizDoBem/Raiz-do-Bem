import { beforeEach, describe, expect, it } from 'vitest';
import {
  getActiveConversations,
  getChatHistory,
  markAsRead,
  sendMessage,
  summarizeChat,
} from '../../services/ChatService';
import { bodyOf, fakeResponse, installFetch, type FetchMock } from '../../test/http';

let fetchMock: FetchMock;
const BASE = 'http://localhost:8000';

beforeEach(() => {
  fetchMock = installFetch();
});

describe('ChatService', () => {
  describe('getChatHistory', () => {
    it('consulta o histórico com telefone codificado, skip e limit', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: [{ id_db: '1' }] }));

      const msgs = await getChatHistory('+5511987654321', 20, 10);

      expect(fetchMock.mock.calls[0][0]).toBe(
        `${BASE}/chat/history/%2B5511987654321?skip=20&limit=10`,
      );
      expect(msgs).toHaveLength(1);
    });

    it('usa skip=0 e limit=20 por padrão', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: [] }));
      await getChatHistory('+5511');
      expect(fetchMock.mock.calls[0][0]).toContain('skip=0&limit=20');
    });

    it('404 vira lista vazia', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 404 }));
      await expect(getChatHistory('+5511')).resolves.toEqual([]);
    });

    it('corpo vazio vira lista vazia', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, text: '' }));
      await expect(getChatHistory('+5511')).resolves.toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('faz POST /chat/send com o payload', async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({ status: 200, body: { status: 'ok', id_db: 'a', id_twilio: 'b' } }),
      );
      const payload = { tel_client: '+5511987654321', text: 'Olá', id_colaborador: 3 };

      const res = await sendMessage(payload);

      expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/chat/send`);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
      expect(bodyOf(fetchMock)).toEqual(payload);
      expect(res).toEqual({ status: 'ok', id_db: 'a', id_twilio: 'b' });
    });

    it('propaga erro do servidor', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 500, body: { detail: 'Twilio fora do ar' } }));
      await expect(sendMessage({ tel_client: '+55', text: 'x' })).rejects.toThrow('Twilio fora do ar');
    });
  });

  describe('getActiveConversations', () => {
    it('devolve as conversas', async () => {
      const conversas = [{ tel_client: '+55', text: 'oi', unread_count: 2 }];
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: conversas }));

      await expect(getActiveConversations()).resolves.toEqual(conversas);
      expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/chat/conversations`);
    });

    it('resposta com erro vira lista vazia', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 500 }));
      await expect(getActiveConversations()).resolves.toEqual([]);
    });

    it('corpo que não é array vira lista vazia', async () => {
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: { erro: true } }));
      await expect(getActiveConversations()).resolves.toEqual([]);
    });

    it('falha de rede vira lista vazia (sem lançar)', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(getActiveConversations()).resolves.toEqual([]);
    });
  });

  describe('markAsRead', () => {
    it('faz PUT /chat/read/{tel} com telefone codificado', async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({ status: 200, body: { status: 'ok', messagens_updated: 3 } }),
      );

      const res = await markAsRead('+5511987654321');

      expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/chat/read/%2B5511987654321`);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('PUT');
      expect(res.messagens_updated).toBe(3);
    });
  });
  describe('summarizeChat', () => {
    it('faz POST /api/chats/{tel}/summarize com telefone codificado', async () => {
      const resumo = {
        tel_client: '+5511977776666',
        necessidade_principal: 'Cesta básica',
        status_atual: 'Aguardando documentos',
        proximos_passos: 'Agendar retirada',
        messages_used: 35,
      };
      fetchMock.mockResolvedValue(fakeResponse({ status: 200, body: resumo }));

      const res = await summarizeChat('+5511977776666');

      expect(fetchMock.mock.calls[0][0]).toBe(`${BASE}/api/chats/%2B5511977776666/summarize`);
      expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
      expect(res).toEqual(resumo);
    });

    it('propaga a mensagem amigável quando o provedor de IA falha (502)', async () => {
      fetchMock.mockResolvedValue(
        fakeResponse({ status: 502, body: { detail: 'Não foi possível gerar o resumo agora.' } }),
      );

      await expect(summarizeChat('+55')).rejects.toThrow('Não foi possível gerar o resumo agora.');
    });
  });
});
