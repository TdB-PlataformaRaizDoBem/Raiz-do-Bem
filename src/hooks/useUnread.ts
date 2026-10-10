import { useContext } from 'react';
import { UnreadContext, type UnreadContextValue } from '../context/unread';

/** Mensagens não lidas do chat (`UnreadProvider`, atualizado a cada 5 s). */
export function useUnread(): UnreadContextValue {
  return useContext(UnreadContext);
}
