import { AUTH_KEYS } from "../data/auth"

export const getUser = () => {
  const userData = localStorage.getItem(AUTH_KEYS.USER);
  if(!userData) return null
  return JSON.parse(userData) as {email: string; role: 'admin' | 'coordenador'}
}