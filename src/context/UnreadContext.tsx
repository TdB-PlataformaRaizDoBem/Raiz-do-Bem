import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getActiveConversations } from "../services/ChatService";
import type { ConversationPreview } from "../domain/entities/ConversationPreview";

interface UnreadContextValue {
  totalUnread: number;
  conversations: ConversationPreview[];
  refresh: () => Promise<void>;
}

const UnreadContext = createContext<UnreadContextValue>({
  totalUnread: 0,
  conversations: [],
  refresh: async () => {},
});

export function UnreadProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    const data = await getActiveConversations();
    setConversations(data);
  }, []);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 5_000);
    return () => {
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

export function useUnread(): UnreadContextValue {
  return useContext(UnreadContext);
}
