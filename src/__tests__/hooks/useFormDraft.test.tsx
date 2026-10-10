import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { loadFormDraft, useFormDraft } from '../../hooks/useFormDraft';

const KEY = 'raiz-do-bem:teste';

beforeEach(() => {
  localStorage.clear();
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
    localStorage.setItem(KEY, JSON.stringify({ nome: 'Ana' }));
    expect(loadFormDraft(KEY)).toEqual({ nome: 'Ana' });
  });

  it('devolve null quando o JSON está corrompido', () => {
    localStorage.setItem(KEY, '{quebrado');
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

  it('salva o rascunho no localStorage após 1s sem digitar (debounce)', () => {
    const { result } = setup();

    act(() => result.current.form.setValue('nome', 'Ana'));
    act(() => result.current.form.setValue('nome', 'Ana Maria'));
    expect(localStorage.getItem(KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(999));
    expect(localStorage.getItem(KEY)).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toEqual({ nome: 'Ana Maria' });
  });

  it('clearDraft apaga o rascunho e cancela a gravação pendente', () => {
    const { result } = setup();
    localStorage.setItem(KEY, '{"nome":"velho"}');

    act(() => result.current.form.setValue('nome', 'novo'));
    act(() => result.current.clearDraft());
    act(() => vi.advanceTimersByTime(2000));

    expect(localStorage.getItem(KEY)).toBeNull();
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
