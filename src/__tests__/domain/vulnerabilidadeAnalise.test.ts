import { describe, expect, it, vi } from 'vitest';
import { toColecaoViewModel } from '../../domain/mappers/VulnerabilidadeMapper';
import { COLUNAS_CSV, ordenarRegioes } from '../../domain/tabelaRegioes';
import { feature, propsUF } from '../../test/vulnerabilidadeFixtures';
import { escaparCelula, gerarCsv } from '../../utils/csvUtils';

/** Uma única feição, já passada pelo ranking de renda (que, com N=1, cai
 *  sempre no meio da escala — ver `domain/rankingRenda.ts`). */
const regiaoUnica = (sobrescrever: Parameters<typeof propsUF>[0] = {}) =>
  toColecaoViewModel({
    type: 'FeatureCollection',
    features: [feature(propsUF(sobrescrever))],
  }).regioes[0];

describe('ordenarRegioes', () => {
  const regioes = toColecaoViewModel({
    type: 'FeatureCollection',
    features: [
      feature(propsUF({ codigo_ibge: '21', nome: 'Maranhão', indicadores: { renda_media: 900 } })),
      feature(propsUF({ codigo_ibge: '35', nome: 'São Paulo', indicadores: { renda_media: 2600 } })),
      feature(propsUF({ codigo_ibge: '12', nome: 'Acre', indicadores: { renda_media: 1500 } })),
    ],
  }).regioes;

  it('ordena nas duas direções sem mutar a entrada', () => {
    const copia = [...regioes];
    // Menor renda = maior atenção: Maranhão (900) > Acre (1500) > SP (2600).
    const desc = ordenarRegioes(regioes, (r) => r.indiceAtencao, 'desc');
    expect(desc.map((r) => r.codigoIbge)).toEqual(['21', '12', '35']);
    expect(regioes).toEqual(copia);
    const asc = ordenarRegioes(regioes, (r) => r.indiceAtencao, 'asc');
    expect(asc.map((r) => r.codigoIbge)).toEqual(['35', '12', '21']);
  });

  it('manda valores ausentes para o fim nas duas direções', () => {
    const comAusente = toColecaoViewModel({
      type: 'FeatureCollection',
      features: [
        ...regioes.map((r) => feature(propsUF({ codigo_ibge: r.codigoIbge, indicadores: { renda_media: r.indicadores.rendaMedia } }))),
        feature(propsUF({ codigo_ibge: '99', indicadores: { renda_media: -1 } })), // inválida -> sem ranking
      ],
    }).regioes;
    const chave = (r: (typeof comAusente)[number]) => r.indiceAtencao;
    expect(ordenarRegioes(comAusente, chave, 'asc').at(-1)?.codigoIbge).toBe('99');
    expect(ordenarRegioes(comAusente, chave, 'desc').at(-1)?.codigoIbge).toBe('99');
  });

  it('compara texto com acentuação do pt-BR e desempata pelo código', () => {
    const nomes = ordenarRegioes(regioes, (r) => r.nome, 'asc').map((r) => r.nome);
    expect(nomes).toEqual(['Acre', 'Maranhão', 'São Paulo']);
    const empatados = ordenarRegioes(regioes, () => 1, 'desc').map((r) => r.codigoIbge);
    expect(empatados).toEqual(['12', '21', '35']);
  });
});

describe('CSV', () => {
  it.each([
    ['=HYPERLINK("x")', `"'=HYPERLINK(""x"")"`],
    ['+55', "'+55"],
    ['-1', "'-1"],
    ['@SUM(A1)', "'@SUM(A1)"],
  ])('neutraliza fórmula em texto: %s', (entrada, esperado) => {
    expect(escaparCelula(entrada)).toBe(esperado);
  });

  it('não neutraliza número negativo, que é dado e não texto externo', () => {
    expect(escaparCelula(-10.43)).toBe('-10,43');
  });

  it('usa vírgula decimal, aspas quando há separador e vazio para ausente', () => {
    expect(escaparCelula(0.4663)).toBe('0,4663');
    expect(escaparCelula('a;b')).toBe('"a;b"');
    expect(escaparCelula(null)).toBe('');
    expect(escaparCelula(Number.NaN)).toBe('');
  });

  it('gera cabeçalho + linhas separados por ; e CRLF', () => {
    const csv = gerarCsv([{ a: 1, b: 'x' }], [
      { cabecalho: 'a', valor: (l) => l.a },
      { cabecalho: 'b', valor: (l) => l.b },
    ]);
    expect(csv).toBe('a;b\r\n1;x');
  });

  it('o layout exportado carrega renda, fonte e procedência — nada de score ou simulação', () => {
    const regiao = regiaoUnica();
    const csv = gerarCsv([regiao], COLUNAS_CSV);
    const [cabecalho, linha] = csv.split('\r\n');
    const colunas = cabecalho.split(';');
    const valores = linha.split(';');
    const valor = (nome: string) => valores[colunas.indexOf(nome)];

    expect(colunas).not.toContain('score_vulnerabilidade');
    expect(colunas).not.toContain('indice_prioridade');
    expect(colunas).not.toContain('demanda_bruta_ano');
    expect(valor('codigo_ibge')).toBe('21');
    expect(valor('renda_media')).toBe('872');
    expect(valor('renda_media_fonte')).toBe('ibge:pnad-continua-2024-rendimento-domiciliar-per-capita');
    expect(valor('populacao')).toBe('6776699');
    expect(valor('fonte_geometria')).toBe('ibge:malhas/v4');
  });
});

describe('baixarCsv', () => {
  it('gera blob com BOM, dispara o download e revoga a URL depois', async () => {
    const { baixarCsv } = await import('../../utils/csvUtils');
    const criar = vi.fn<(b: Blob) => string>(() => 'blob:x');
    const revogar = vi.fn();
    Object.assign(URL, { createObjectURL: criar, revokeObjectURL: revogar });
    const clique = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.useFakeTimers();

    baixarCsv('a.csv', 'x;y');

    const blob = criar.mock.calls[0][0];
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(clique).toHaveBeenCalled();
    expect(revogar).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revogar).toHaveBeenCalledWith('blob:x');
    vi.useRealTimers();
  });
});
