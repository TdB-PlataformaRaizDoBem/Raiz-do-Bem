/**
 * Substitui `@testing-library/react` nos testes (via moduleNameMapper do Jest): `render` e
 * `renderHook` passam a embrulhar tudo num QueryClientProvider com um cache NOVO por chamada,
 * como o App faz em produção. Os testes continuam importando de '@testing-library/react'.
 */
import type { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import * as rtl from '../../node_modules/@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { createTestQueryClient } from './queryClient';

// Arquivo só de testes: re-exporta a biblioteca inteira (não é um componente do app).
// eslint-disable-next-line react-refresh/only-export-components
export * from '../../node_modules/@testing-library/react';

type WrapperType = React.JSXElementConstructor<{ children: ReactNode }>;

/** Compõe o provider do cache por fora do wrapper (se houver) que o teste passou. */
function comCache(client: QueryClient, Interno?: WrapperType): WrapperType {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {Interno ? <Interno>{children}</Interno> : children}
      </QueryClientProvider>
    );
  };
}

export function render(
  ui: ReactElement,
  options: Omit<rtl.RenderOptions, 'queries'> & { queryClient?: QueryClient } = {},
) {
  const { queryClient = createTestQueryClient(), wrapper, ...resto } = options;
  return rtl.render(ui, { ...resto, wrapper: comCache(queryClient, wrapper as WrapperType | undefined) });
}

export function renderHook<Result, Props>(
  callback: (props: Props) => Result,
  options: Omit<rtl.RenderHookOptions<Props>, 'queries'> & { queryClient?: QueryClient } = {},
) {
  const { queryClient = createTestQueryClient(), wrapper, ...resto } = options;
  return rtl.renderHook(callback, { ...resto, wrapper: comCache(queryClient, wrapper as WrapperType | undefined) });
}
