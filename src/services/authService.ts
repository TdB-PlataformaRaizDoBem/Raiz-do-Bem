import type { LoginResponseDTO } from '../domain/types/auth';
import { handleResponse, safeFetch } from './httpClient';

const AUTH_PATH = '/auth';

/**
 * O token retornado deve ser:
 *   Armazenado em memória via tokenStore.set(token)
 *   Decodificado via extractAuthUser(token) para popular o AuthUser
 */
export async function loginRequest(
  email: string,
  senha: string,
): Promise<LoginResponseDTO> {
  const res = await safeFetch(`${AUTH_PATH}/login`, {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
  return handleResponse<LoginResponseDTO>(res);
}
