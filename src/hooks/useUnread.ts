import { useContext } from 'react';
import { UnreadContext, type UnreadContextValue } from '../context/unread';

export function useUnread(): UnreadContextValue {
  return useContext(UnreadContext);
}
