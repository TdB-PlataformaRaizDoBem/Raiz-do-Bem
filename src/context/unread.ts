import { createContext } from 'react';
import type { ConversationPreview } from '../domain/entities/ConversationPreview';

export interface UnreadContextValue {
  totalUnread: number;
  conversations: ConversationPreview[];
  refresh: () => Promise<void>;
}

export const UnreadContext = createContext<UnreadContextValue>({
  totalUnread: 0,
  conversations: [],
  refresh: async () => {},
});
