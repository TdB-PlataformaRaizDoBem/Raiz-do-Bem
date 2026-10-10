import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

/** Cada teste carrega cópias limpas: os módulos guardam estado (tokens, handlers, URL base). */
beforeEach(() => {
  vi.resetModules();
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function carregarHttp() {
  const http = await import('../../services/httpClient');
  const { tokenStore } = await import('../../services/tokenStore');
  const fetchMock = installFetch();
  return { http, tokenStore, fetchMock };
}

describe('httpClient — 401 sem handler de logout registrado', () => {
  it('limpa a sessão e redireciona para o login (rede de segurança antes de o AuthProvider montar)', async () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { ...window.location, replace });
    const { http, tokenStore, fetchMock } = await carregarHttp();
    tokenStore.set('jwt', null as unknown as string);
    fetchMock.mockResolvedValue(fakeResponse({ status: 401 }));

    await expect(http.safeFetch('/qualquer')).rejects.toThrow('Sessão expirada');

    expect(replace).toHaveBeenCalledWith('/auth/login');
    expect(tokenStore.get()).toBeNull();
  });
});

describe('httpClient — mensagens de erro', () => {
  const erroDe = async (res: Response) => {
    const { http } = await carregarHttp();
    return http.handleResponse(res).catch((e: Error) => e.message);
  };

  it('prefere body.detail', async () => {
    expect(await erroDe(fakeResponse({ status: 422, body: { detail: 'CPF inválido' } }))).toBe('CPF inválido');
  });

  it('depois body.mensagem', async () => {
    expect(await erroDe(fakeResponse({ status: 422, body: { mensagem: 'Já cadastrado' } }))).toBe('Já cadastrado');
  });

  it('depois body.message', async () => {
    expect(await erroDe(fakeResponse({ status: 400, body: { message: 'Requisição ruim' } }))).toBe('Requisição ruim');
  });

  it('corpo sem mensagem usa o texto do status', async () => {
    expect(await erroDe(fakeResponse({ status: 404, body: {} }))).toBe('Recurso não encontrado.');
    expect(await erroDe(fakeResponse({ status: 403, body: null }))).toBe('Você não tem permissão para realizar esta ação.');
  });

  it('corpo que não é JSON também cai no texto do status', async () => {
    expect(await erroDe(fakeResponse({ status: 500, text: '<html>erro</html>' }))).toBe(
      'Erro interno no servidor. Tente novamente mais tarde.',
    );
  });

  it('status sem texto próprio vira "Erro NNN"', async () => {
    expect(await erroDe(fakeResponse({ status: 418, text: '' }))).toBe('Erro 418');
  });
});

describe('httpClient — publicFetch e URLs', () => {
  it('URL absoluta é usada como está', async () => {
    const { http, fetchMock } = await carregarHttp();
    fetchMock.mockResolvedValue(fakeResponse({ status: 200 }));

    await http.publicFetch('https://exemplo.org/ping');

    expect(fetchMock.mock.calls[0][0]).toBe('https://exemplo.org/ping');
  });

  it('sem cabeçalhos informados envia um objeto vazio', async () => {
    const { http, fetchMock } = await carregarHttp();
    fetchMock.mockResolvedValue(fakeResponse({ status: 200 }));

    await http.publicFetch('/ping');

    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({});
  });

  it('sem VITE_API_BASE_URL as URLs ficam relativas', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined as unknown as string);
    const { http, fetchMock } = await carregarHttp();
    fetchMock.mockResolvedValue(fakeResponse({ status: 200 }));

    await http.safeFetch('/beneficiario');
    await http.publicFetch('/publico');

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/beneficiario', '/publico']);
  });
});

describe('serviços — URL base padrão quando a variável de ambiente não existe', () => {
  const CASOS: Array<[string, string, string]> = [
    ['EspecialidadeService', 'getEspecialidades', '/especialidades'],
    ['ProgramaService', 'getProgramasSociais', '/programas-sociais'],
    ['AtendimentoService', 'getAtendimentos', '/atendimento'],
    ['Beneficiarioservice', 'getBeneficiariosCompletos', '/beneficiario'],
    ['ColaboradorService', 'getColaboradoresCompletos', '/colaborador'],
    ['DentistaService', 'getDentistasCompletos', '/dentista'],
    ['PedidoService', 'getPedidosCompletos', '/pedido-ajuda'],
  ];

  let fetchMock: FetchMock;

  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', undefined as unknown as string);
    fetchMock = installFetch();
    fetchMock.mockImplementation(async () => fakeResponse({ status: 200, body: [] }));
  });

  it.each(CASOS)('%s.%s consulta %s (relativa)', async (modulo, funcao, caminho) => {
    const servico = (await import(`../../services/${modulo}.ts`)) as Record<string, () => Promise<unknown>>;

    await servico[funcao]();

    expect(fetchMock.mock.calls[0][0]).toBe(caminho);
  });

  it('a API geográfica cai em http://localhost:8000 quando VITE_GEO_API_URL não existe', async () => {
    vi.stubEnv('VITE_GEO_API_URL', undefined as unknown as string);
    fetchMock.mockImplementation(async () => fakeResponse({ status: 200, body: { status: 'ok' } }));
    const { getSaudeGeoApi } = await import('../../services/VulnerabilidadeService');

    await getSaudeGeoApi();

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/api/v1/health');
  });
});

describe('tokenStore — armazenamento indisponível', () => {
  it('se o localStorage não puder ser lido, a sessão começa vazia', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const { tokenStore } = await import('../../services/tokenStore');

    expect(tokenStore.get()).toBeNull();
    expect(tokenStore.getRefresh()).toBeNull();
    expect(tokenStore.exists()).toBe(false);
  });
});
