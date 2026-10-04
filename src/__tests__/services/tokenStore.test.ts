import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// tokenStore guarda estado em variáveis de módulo: cada teste carrega uma cópia limpa.
async function loadStore() {
  jest.resetModules();
  const { tokenStore } = await import('../../services/tokenStore');
  return tokenStore;
}

describe('tokenStore', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('começa sem sessão', async () => {
    const store = await loadStore();
    expect(store.get()).toBeNull();
    expect(store.getRefresh()).toBeNull();
    expect(store.exists()).toBe(false);
  });

  it('guarda access e refresh token', async () => {
    const store = await loadStore();
    store.set('access', 'refresh');
    expect(store.get()).toBe('access');
    expect(store.getRefresh()).toBe('refresh');
    expect(store.exists()).toBe(true);
  });

  it('persiste na sessionStorage (sobrevive ao F5)', async () => {
    const primeira = await loadStore();
    primeira.set('access', 'refresh');

    // "F5": módulo recarregado, memória zerada, sessionStorage mantida
    const aposReload = await loadStore();
    expect(aposReload.get()).toBe('access');
    expect(aposReload.getRefresh()).toBe('refresh');
  });

  it('set sem refreshToken preserva o refresh anterior', async () => {
    const store = await loadStore();
    store.set('access-1', 'refresh-1');
    store.set('access-2');
    expect(store.get()).toBe('access-2');
    expect(store.getRefresh()).toBe('refresh-1');
  });

  it('set com refreshToken null remove o refresh', async () => {
    const store = await loadStore();
    store.set('access', 'refresh');
    store.set('access', null);
    expect(store.getRefresh()).toBeNull();
    expect(window.sessionStorage.getItem('rdb.refreshToken')).toBeNull();
  });

  it('clear apaga memória e sessionStorage', async () => {
    const store = await loadStore();
    store.set('access', 'refresh');
    store.clear();

    expect(store.get()).toBeNull();
    expect(store.getRefresh()).toBeNull();
    expect(window.sessionStorage.getItem('rdb.accessToken')).toBeNull();
    expect(window.sessionStorage.getItem('rdb.refreshToken')).toBeNull();

    const aposReload = await loadStore();
    expect(aposReload.exists()).toBe(false);
  });

  it('segue funcionando em memória se a sessionStorage estiver indisponível', async () => {
    const store = await loadStore();
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(() => store.set('access', 'refresh')).not.toThrow();
    expect(store.get()).toBe('access');
    expect(store.getRefresh()).toBe('refresh');

    getItem.mockRestore();
    setItem.mockRestore();
  });
});
