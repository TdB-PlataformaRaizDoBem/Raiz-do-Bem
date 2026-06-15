import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { getActiveConversations } from '../services/ChatService';
import { UnreadContext } from './unread';
import type { ConversationPreview } from '../domain/entities/ConversationPreview';

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const data = await getActiveConversations();
    setConversations(data);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(refresh, 0);
    intervalRef.current = setInterval(refresh, 5_000);
    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  return (
    <UnreadContext.Provider value={{ totalUnread, conversations, refresh }}>
      {children}
    </UnreadContext.Provider>
  );
}
