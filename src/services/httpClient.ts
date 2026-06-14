const STATUS_MESSAGES: Partial<Record<number, string>> = {
  401: "Sessão expirada. Por favor, faça login novamente.",
  422: "Dados inválidos. Verifique os campos preenchidos.",
  500: "Erro interno no servidor. Tente novamente mais tarde.",
};

async function extractErrorMessage(res: Response): Promise<string> {
  const fallback = STATUS_MESSAGES[res.status] ?? `Erro ${res.status}`;
  try {
    const body = await res.json();
    return body?.detail ?? body?.mensagem ?? body?.message ?? fallback;
  } catch {
    return fallback;
  }
}

export async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }

  if (res.status === 204) return undefined as T;

  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") return undefined as T;

  try {
    const texto = await res.text();
    return texto ? (JSON.parse(texto) as T) : (undefined as T);
  } catch {
    return undefined as T;
  }
}

export async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res));
  }
}

export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error("Sem conexão com a internet. Verifique sua rede.");
  }
}
