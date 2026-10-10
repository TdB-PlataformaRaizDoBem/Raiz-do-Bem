import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { loadFormDraft, useFormDraft } from '../../hooks/useFormDraft';

const KEY = 'raiz-do-bem:teste';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('loadFormDraft', () => {
  it('devolve null quando não há rascunho', () => {
    expect(loadFormDraft(KEY)).toBeNull();
  });

  it('devolve o rascunho salvo', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ nome: 'Ana' }));
    expect(loadFormDraft(KEY)).toEqual({ nome: 'Ana' });
  });

  it('devolve null quando o JSON está corrompido', () => {
    sessionStorage.setItem(KEY, '{quebrado');
    expect(loadFormDraft(KEY)).toBeNull();
  });
});

describe('useFormDraft', () => {
  function setup(isDirty = false) {
    return renderHook(
      ({ dirty }) => {
        const form = useForm<{ nome: string }>({ defaultValues: { nome: '' } });
        const draft = useFormDraft(KEY, form.watch, dirty);
        return { form, ...draft };
      },
      { initialProps: { dirty: isDirty } },
    );
  }

  it('salva o rascunho no sessionStorage após 1s sem digitar (debounce)', () => {
    const { result } = setup();

    act(() => result.current.form.setValue('nome', 'Ana'));
    act(() => result.current.form.setValue('nome', 'Ana Maria'));
    expect(sessionStorage.getItem(KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(999));
    expect(sessionStorage.getItem(KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(JSON.parse(sessionStorage.getItem(KEY) ?? '{}')).toEqual({ nome: 'Ana Maria' });
  });

  it('clearDraft apaga o rascunho e cancela a gravação pendente', () => {
    const { result } = setup();
    sessionStorage.setItem(KEY, '{"nome":"velho"}');

    act(() => result.current.form.setValue('nome', 'novo'));
    act(() => result.current.clearDraft());
    act(() => vi.advanceTimersByTime(2000));

    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it('avisa antes de sair da página quando o formulário está sujo', () => {
    setup(true);

    const evento = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(evento);

    expect(evento.defaultPrevented).toBe(true);
  });

  it('não avisa quando o formulário está limpo', () => {
    setup(false);

    const evento = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(evento);

    expect(evento.defaultPrevented).toBe(false);
  });

  it('remove o listener ao desmontar', () => {
    const { unmount } = setup(true);
    unmount();

    const evento = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(evento);

    expect(evento.defaultPrevented).toBe(false);
  });
});

describe('privacidade do rascunho', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('não grava os campos omitidos (CPF, relato, autorizações)', () => {
    const { result } = renderHook(() => {
      const form = useForm<{ nome: string; cpf: string }>({ defaultValues: { nome: '', cpf: '' } });
      return { form, ...useFormDraft(KEY, form.watch, false, ['cpf']) };
    });

    act(() => result.current.form.setValue('nome', 'Ana'));
    act(() => result.current.form.setValue('cpf', '12345678901'));
    act(() => vi.advanceTimersByTime(1000));

    expect(JSON.parse(sessionStorage.getItem(KEY) ?? '{}')).toEqual({ nome: 'Ana' });
  });

  it('ignora campos omitidos que já estavam no rascunho salvo', () => {
    sessionStorage.setItem(KEY, JSON.stringify({ nome: 'Ana', cpf: '12345678901' }));

    expect(loadFormDraft(KEY, ['cpf'])).toEqual({ nome: 'Ana' });
  });

  it('apaga o rascunho antigo que versões anteriores gravavam em localStorage', () => {
    localStorage.setItem(KEY, JSON.stringify({ nome: 'Ana', cpf: '12345678901' }));

    expect(loadFormDraft(KEY)).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('não quebra quando o storage está bloqueado', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });

    expect(loadFormDraft(KEY)).toBeNull();

    const { result } = renderHook(() => {
      const form = useForm<{ nome: string }>({ defaultValues: { nome: '' } });
      return { form, ...useFormDraft(KEY, form.watch, false) };
    });
    act(() => result.current.form.setValue('nome', 'Ana'));
    expect(() => act(() => vi.advanceTimersByTime(1000))).not.toThrow();
    expect(() => act(() => result.current.clearDraft())).not.toThrow();
  });
});
