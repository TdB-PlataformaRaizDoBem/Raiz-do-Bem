import { describe, expect, it, jest } from '@jest/globals';
import {
  toColecaoViewModel,
  toRegiaoViewModel,
} from '../../domain/mappers/VulnerabilidadeMapper';
import { COLUNAS_CSV, ordenarRegioes } from '../../domain/tabelaRegioes';
import { ANALISE_COLECAO, feature, propsUF } from '../../test/vulnerabilidadeFixtures';
import { escaparCelula, gerarCsv } from '../../utils/csvUtils';

describe('mapper da análise', () => {
  it('traduz posição, comparativo e sensibilidade para camelCase', () => {
    const r = toRegiaoViewModel(feature(propsUF()));
    expect(r.analise?.posicaoPrioridade).toBe(1);
    expect(r.analise?.comparativo[0]).toMatchObject({
      chave: 'taxa_pobreza',
      label: 'Pobreza',
      referencia: 28.59,
      desfavoravel: true,
    });
    expect(r.analise?.comparativo[0].formatar(53.8)).toBe('53,8%');
    expect(r.analise?.sensibilidade).toEqual({
      reducaoPor100Voluntarios: 0.0372,
      voluntariosParaFaixaInferior: 54,
      faixaInferior: 'media',
    });
  });

  it('degrada para null num back-end que ainda não envia `analise`', () => {
    const r = toRegiaoViewModel(feature(propsUF({ analise: undefined })));
    expect(r.analise).toBeNull();
    const c = toColecaoViewModel({ type: 'FeatureCollection', features: [] });
    expect(c.analise).toBeNull();
    expect(c.metodoScore).toBeNull();
  });

  it('ignora indicador desconhecido em vez de quebrar a tela', () => {
    const base = propsUF();
    const r = toRegiaoViewModel(
      feature({
        ...base,
        analise: {
          ...base.analise!,
          comparativo: [
            // @ts-expect-error — simula um indicador que o back-end passou a enviar
            { indicador: 'novo_indicador', valor: 1, referencia_nacional: 1, desfavoravel: false },
          ],
        },
      }),
    );
    expect(r.analise?.comparativo).toEqual([]);
  });

  it('mapeia a análise da coleção e os metadados', () => {
    const c = toColecaoViewModel({
      type: 'FeatureCollection',
      features: [feature(propsUF())],
      analise: ANALISE_COLECAO,
      metadados: {
        nivel: 'uf',
        fonte: 'mock',
        referencia_temporal: 'Censo 2022',
        crs: 'EPSG:4326',
        metodo_score: 'v1',
        cache_hit: false,
        gerado_em: '2026-10-04T12:00:00+00:00',
      },
    });
    expect(c.analise?.referencia.scoreMedio).toBe(0.2981);
    expect(c.analise?.capacidade?.unidadesSimuladas).toBe(1);
    expect(c.analise?.parametros.modelo.faixaPopulacaoTreino).toEqual([5000, 3_000_000]);
    expect(c.geradoEm).toBe('2026-10-04T12:00:00+00:00');
  });
});

describe('ordenarRegioes', () => {
  const regioes = [
    toRegiaoViewModel(feature(propsUF({ codigo_ibge: '21', nome: 'Maranhão', indice_prioridade: 0.6 }))),
    toRegiaoViewModel(feature(propsUF({ codigo_ibge: '35', nome: 'São Paulo', indice_prioridade: 0.2, simulacao: null }))),
    toRegiaoViewModel(feature(propsUF({ codigo_ibge: '12', nome: 'Acre', indice_prioridade: 0.4 }))),
  ];

  it('ordena nas duas direções sem mutar a entrada', () => {
    const copia = [...regioes];
    const desc = ordenarRegioes(regioes, (r) => r.indicePrioridade, 'desc');
    expect(desc.map((r) => r.codigoIbge)).toEqual(['21', '12', '35']);
    expect(regioes).toEqual(copia);
    const asc = ordenarRegioes(regioes, (r) => r.indicePrioridade, 'asc');
    expect(asc.map((r) => r.codigoIbge)).toEqual(['35', '12', '21']);
  });

  it('manda valores ausentes para o fim nas duas direções', () => {
    const chave = (r: (typeof regioes)[number]) => r.simulacao?.coberturaPercent ?? null;
    expect(ordenarRegioes(regioes, chave, 'asc').at(-1)?.codigoIbge).toBe('35');
    expect(ordenarRegioes(regioes, chave, 'desc').at(-1)?.codigoIbge).toBe('35');
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

  it('o layout exportado carrega indicador, referência e desvio', () => {
    const regiao = toRegiaoViewModel(feature(propsUF()));
    const csv = gerarCsv([regiao], COLUNAS_CSV);
    const [cabecalho, linha] = csv.split('\r\n');
    const colunas = cabecalho.split(';');
    const valores = linha.split(';');
    const valor = (nome: string) => valores[colunas.indexOf(nome)];

    expect(valor('codigo_ibge')).toBe('21');
    expect(valor('taxa_pobreza')).toBe('53,8');
    expect(valor('taxa_pobreza_brasil')).toBe('28,59');
    expect(valor('idh_desvio_pct')).toBe('-10,43');
    expect(valor('voluntarios_para_faixa_inferior')).toBe('54');
    expect(valor('renda_media')).toBe(''); // não veio no comparativo
  });
});

describe('baixarCsv', () => {
  it('gera blob com BOM, dispara o download e revoga a URL depois', async () => {
    const { baixarCsv } = await import('../../utils/csvUtils');
    const criar = jest.fn<(b: Blob) => string>(() => 'blob:x');
    const revogar = jest.fn();
    Object.assign(URL, { createObjectURL: criar, revokeObjectURL: revogar });
    const clique = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    jest.useFakeTimers();

    baixarCsv('a.csv', 'x;y');

    const blob = criar.mock.calls[0][0];
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(clique).toHaveBeenCalled();
    expect(revogar).not.toHaveBeenCalled();
    jest.runAllTimers();
    expect(revogar).toHaveBeenCalledWith('blob:x');
    jest.useRealTimers();
  });
});
