import { describe, expect, it } from 'vitest';
import {
  NOME_DO_SITE,
  TITULO_NAO_ENCONTRADA,
  tituloDaAba,
  tituloDaPaginaInterna,
} from '../../Routes/titulos';

describe('tituloDaPaginaInterna', () => {
  it.each([
    ['/admin/dashboard', 'Dashboard'],
    ['/coord/dashboard', 'Dashboard'],
    ['/admin/colaboradores', 'Gerenciar Colaboradores'],
    ['/admin/dentistas', 'Gerenciar Dentistas'],
    ['/coord/dentistas', 'Gerenciar Dentistas'],
    ['/admin/beneficiarios', 'Gerenciar Beneficiários'],
    ['/coord/beneficiarios', 'Gerenciar Beneficiários'],
    ['/admin/solicitacoes', 'Pedidos de Ajuda'],
    ['/coord/solicitacoes', 'Pedidos de Ajuda'],
    ['/admin/atendimento', 'Gerenciar Atendimentos'],
    ['/coord/atendimento', 'Gerenciar Atendimentos'],
    ['/admin/mapa', 'Mapa de Vulnerabilidade'],
    ['/admin/ajuda', 'Como Usar a Plataforma'],
    ['/coord/ajuda', 'Como Usar a Plataforma'],
    ['/admin/chat', 'Conversas'],
    ['/coord/chat', 'Conversas'],
  ])('%s → %s', (caminho, titulo) => {
    expect(tituloDaPaginaInterna(caminho)).toBe(titulo);
  });

  it('a conversa aberta tem título próprio, sem o telefone', () => {
    expect(tituloDaPaginaInterna('/admin/chat/5511999999999')).toBe('Conversa');
    expect(tituloDaPaginaInterna('/coord/chat/5511999999999')).toBe('Conversa');
  });

  it('ignora a barra final, as barras duplicadas e as maiúsculas, como o roteador faz', () => {
    expect(tituloDaPaginaInterna('/admin/dashboard/')).toBe('Dashboard');
    expect(tituloDaPaginaInterna('/Admin/Dashboard')).toBe('Dashboard');
    expect(tituloDaPaginaInterna('//coord//ajuda')).toBe('Como Usar a Plataforma');
  });

  it('o coordenador não tem as páginas exclusivas do administrador', () => {
    expect(tituloDaPaginaInterna('/coord/mapa')).toBeUndefined();
    expect(tituloDaPaginaInterna('/coord/colaboradores')).toBeUndefined();
  });

  it.each(['/', '/sobre', '/admin', '/admin/', '/admin/xyz', '/admin/dashboard/extra', '/admin/chat/1/2', '/auth/login', '/outra/dashboard'])(
    '%s não é página da área logada',
    (caminho) => {
      expect(tituloDaPaginaInterna(caminho)).toBeUndefined();
    },
  );

  it('nomes herdados do objeto (constructor, toString…) não viram página', () => {
    expect(tituloDaPaginaInterna('/admin/constructor')).toBeUndefined();
    expect(tituloDaPaginaInterna('/admin/toString')).toBeUndefined();
    expect(tituloDaPaginaInterna('/coord/__proto__')).toBeUndefined();
  });
});

describe('tituloDaAba', () => {
  it.each([
    ['/auth/login', 'Login | Raiz do Bem'],
    ['/auth/login/', 'Login | Raiz do Bem'],
    ['/403', 'Acesso Negado | Raiz do Bem'],
    ['/admin/dashboard', 'Dashboard | Raiz do Bem'],
    ['/coord/chat/5511999999999', 'Conversa | Raiz do Bem'],
    ['/admin/mapa', 'Mapa de Vulnerabilidade | Raiz do Bem'],
  ])('%s → "%s"', (caminho, titulo) => {
    expect(tituloDaAba(caminho)).toBe(titulo);
  });

  it.each(['/nao-existe', '/admin/xyz', '/coord/mapa', '/auth/cadastro', '/auth'])(
    '%s → página não encontrada',
    (caminho) => {
      expect(tituloDaAba(caminho)).toBe(`${TITULO_NAO_ENCONTRADA} | ${NOME_DO_SITE}`);
    },
  );
});
