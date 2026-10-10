import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '../../context/auth';
import type { AuthUser, UserRole } from '../../domain/types/auth';
import { ProtectedRoutes } from '../../Routes/ProtectedRoutes';

const noop = async () => {};

function ctx(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: noop,
    logout: () => {},
    ...overrides,
  };
}

function userWithRole(role: UserRole): AuthUser {
  return { email: 'u@raizdobem.org', nome: 'Usuário', role, exp: 9999999999 };
}

function renderRoutes(value: AuthContextValue, allowedRoles?: UserRole[], start = '/privada') {
  const wrap = (children: ReactNode) => (
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[start]}>{children}</MemoryRouter>
    </AuthContext.Provider>
  );

  return render(
    wrap(
      <Routes>
        <Route path="/auth/login" element={<p>Página de login</p>} />
        <Route path="/403" element={<p>Acesso negado</p>} />
        <Route element={<ProtectedRoutes allowedRoles={allowedRoles} />}>
          <Route path="/privada" element={<p>Conteúdo privado</p>} />
        </Route>
      </Routes>,
    ),
  );
}

describe('ProtectedRoutes', () => {
  it('mostra o loader enquanto a sessão está sendo verificada (sem redirecionar)', () => {
    renderRoutes(ctx({ isLoading: true }));

    expect(screen.getByRole('status', { name: /verificando autenticação/i })).toBeInTheDocument();
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
    expect(screen.queryByText('Conteúdo privado')).not.toBeInTheDocument();
  });

  it('redireciona para o login quando não há sessão', () => {
    renderRoutes(ctx());

    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo privado')).not.toBeInTheDocument();
  });

  it('não confia só em isAuthenticated: sem user também redireciona', () => {
    renderRoutes(ctx({ isAuthenticated: true, user: null }));

    expect(screen.getByText('Página de login')).toBeInTheDocument();
  });

  it('qualquer usuário autenticado acessa quando não há restrição de role', () => {
    renderRoutes(ctx({ isAuthenticated: true, user: userWithRole('COLABORADOR') }));

    expect(screen.getByText('Conteúdo privado')).toBeInTheDocument();
  });

  it('ADMIN acessa rota restrita a ADMIN', () => {
    renderRoutes(ctx({ isAuthenticated: true, user: userWithRole('ADMIN') }), ['ADMIN']);

    expect(screen.getByText('Conteúdo privado')).toBeInTheDocument();
  });

  it('COLABORADOR é enviado para /403 em rota restrita a ADMIN', () => {
    renderRoutes(ctx({ isAuthenticated: true, user: userWithRole('COLABORADOR') }), ['ADMIN']);

    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo privado')).not.toBeInTheDocument();
  });

  it('ADMIN é enviado para /403 em rota restrita a COLABORADOR', () => {
    renderRoutes(ctx({ isAuthenticated: true, user: userWithRole('ADMIN') }), ['COLABORADOR']);

    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
  });

  it('aceita mais de uma role permitida', () => {
    renderRoutes(ctx({ isAuthenticated: true, user: userWithRole('COLABORADOR') }), [
      'ADMIN',
      'COLABORADOR',
    ]);

    expect(screen.getByText('Conteúdo privado')).toBeInTheDocument();
  });
});
