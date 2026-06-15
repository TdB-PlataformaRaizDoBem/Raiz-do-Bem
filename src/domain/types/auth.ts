export type UserRole = 'ADMIN' | 'COLABORADOR';

export interface AuthUser {
  email: string;
  nome: string;
  role: UserRole;
  exp: number;
}

export interface LoginResponseDTO {
  token: string;
  tipo: string;
}

export interface JwtPayload {
  iss: string;
  sub: string;
  nome: string;
  groups: string[];
  exp: number;
  iat: number;
}
