import { beforeEach, describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEffect, type ReactNode } from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { useCep } from '../../hooks/useCep';
import { fakeResponse, installFetch, type FetchMock } from '../../test/http';

interface Form {
  endereco: { cep: string; rua: string; bairro: string; cidade: string; uf: string };
  cep: string;
  cidade: string;
}

let fetchMock: FetchMock;
const form: { current: UseFormReturn<Form> | null } = { current: null };
const methods = () => form.current!;

function Wrapper({ children }: { children: ReactNode }) {
  const metodos = useForm<Form>({
    defaultValues: {
      cep: '',
      cidade: '',
      endereco: { cep: '', rua: '', bairro: '', cidade: '', uf: '' },
    },
  });
  useEffect(() => {
    form.current = metodos;
  });
  return <FormProvider {...metodos}>{children}</FormProvider>;
}

const viaCep = (body: unknown) =>
  fakeResponse({ status: 200, body, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  fetchMock = installFetch();
});

describe('useCep', () => {
  it('não consulta na primeira renderização, mesmo com CEP preenchido', () => {
    renderHook(() => useCep<Form>('01001000', 'endereco'), { wrapper: Wrapper });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('não consulta enquanto o CEP não tem 8 dígitos', () => {
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '0100' });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('com CEP completo consulta o ViaCEP e preenche os campos com prefixo', async () => {
    fetchMock.mockResolvedValue(
      viaCep({ cep: '01001-000', logradouro: 'Praça da Sé', bairro: 'Sé', localidade: 'São Paulo', uf: 'SP' }),
    );
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '01001-000' });

    await waitFor(() => expect(methods().getValues('endereco.cidade')).toBe('São Paulo'));
    expect(fetchMock.mock.calls[0][0]).toBe('https://viacep.com.br/ws/01001000/json/');
    expect(methods().getValues('endereco.rua')).toBe('Praça da Sé');
    expect(methods().getValues('endereco.bairro')).toBe('Sé');
    expect(methods().getValues('endereco.uf')).toBe('SP');
  });

  it('sem prefixo preenche campos na raiz do formulário', async () => {
    fetchMock.mockResolvedValue(viaCep({ cep: 'x', localidade: 'Campinas', uf: 'SP' }));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '13010000' });

    await waitFor(() => expect(methods().getValues('cidade')).toBe('Campinas'));
  });

  it('logradouro e bairro ausentes viram string vazia', async () => {
    fetchMock.mockResolvedValue(viaCep({ cep: 'x', localidade: 'Campinas', uf: 'SP' }));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '13010000' });

    await waitFor(() => expect(methods().getValues('endereco.cidade')).toBe('Campinas'));
    expect(methods().getValues('endereco.rua')).toBe('');
    expect(methods().getValues('endereco.bairro')).toBe('');
  });

  it('CEP inexistente (erro:true) marca erro no campo do CEP e não preenche nada', async () => {
    fetchMock.mockResolvedValue(viaCep({ erro: true }));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '99999999' });

    await waitFor(() =>
      expect(methods().formState.errors.endereco?.cep?.message).toBe(
        'CEP não encontrado. Verifique ou preencha manualmente.',
      ),
    );
    expect(methods().getValues('endereco.cidade')).toBe('');
  });

  it('ViaCEP fora do ar: mostra o aviso no campo do CEP e não deixa promise rejeitada solta', async () => {
    const naoTratadas: unknown[] = [];
    const registrar = (motivo: unknown) => naoTratadas.push(motivo);
    process.on('unhandledRejection', registrar);
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '01001000' });

    await waitFor(() =>
      expect(methods().formState.errors.endereco?.cep?.message).toBe('Não foi possível consultar o CEP agora. Tente novamente.'),
    );
    await new Promise((r) => setTimeout(r, 20));
    process.off('unhandledRejection', registrar);
    expect(naoTratadas).toEqual([]);
    expect(methods().getValues('endereco.cidade')).toBe('');
  });

  it('erro HTTP do ViaCEP (ex.: 500) também mostra o aviso', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 500, body: { message: 'indisponível' } }));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '01001000' });

    await waitFor(() =>
      expect(methods().formState.errors.endereco?.cep?.message).toBe('Não foi possível consultar o CEP agora. Tente novamente.'),
    );
  });

  it('consulta cancelada (AbortError) não mostra aviso ao usuário', async () => {
    fetchMock.mockRejectedValue(Object.assign(new Error('abortado'), { name: 'AbortError' }));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '01001000' });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(methods().formState.errors.endereco?.cep).toBeUndefined();
  });

  it('um CEP válido depois de uma falha limpa o aviso', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    fetchMock.mockResolvedValueOnce(viaCep({ cep: 'x', logradouro: 'Praça da Sé', localidade: 'São Paulo', uf: 'SP' }));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '01001000' });
    await waitFor(() => expect(methods().formState.errors.endereco?.cep).toBeDefined());

    rerender({ cep: '01001001' });

    await waitFor(() => expect(methods().getValues('endereco.cidade')).toBe('São Paulo'));
    expect(methods().formState.errors.endereco?.cep).toBeUndefined();
  });

  it('corpo vazio (204) não faz nada', async () => {
    fetchMock.mockResolvedValue(fakeResponse({ status: 204 }));
    const { rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '01001000' });

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(methods().getValues('endereco.cidade')).toBe('');
  });

  it('expõe o estado de loading', async () => {
    let liberar: (r: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((res) => (liberar = res)));
    const { result, rerender } = renderHook(({ cep }) => useCep<Form>(cep, 'endereco'), {
      wrapper: Wrapper,
      initialProps: { cep: '' },
    });

    rerender({ cep: '01001000' });
    await waitFor(() => expect(result.current.loading).toBe(true));

    liberar(fakeResponse({ status: 204 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
