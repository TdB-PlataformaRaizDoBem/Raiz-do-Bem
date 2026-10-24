import type { jsPDF } from "jspdf";
import type { PedidoViewModel } from "../domain/mappers/PedidoMapper";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const FOOTER_Y = PAGE_HEIGHT - 12;

const COLOR = {
  darkgreen: [0, 106, 78] as const,
  amber: [251, 174, 23] as const,
  darkgray: [51, 51, 51] as const,
  gray: [102, 102, 102] as const,
  lightgray: [238, 238, 238] as const,
  white: [255, 255, 255] as const,
};

function drawHeader(doc: jsPDF) {
  doc.setFillColor(...COLOR.darkgreen);
  doc.rect(0, 0, PAGE_WIDTH, 16, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLOR.white);
  doc.text("Raiz do Bem", MARGIN_X, 10.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Relatório de Pedido de Ajuda", PAGE_WIDTH - MARGIN_X, 10.5, {
    align: "right",
  });
}

function drawFooter(doc: jsPDF, pageAtual: number, totalPaginas: number) {
  const geradoEm = new Date().toLocaleString("pt-BR");

  doc.setDrawColor(...COLOR.lightgray);
  doc.setLineWidth(0.3);
  doc.line(MARGIN_X, FOOTER_Y - 4, PAGE_WIDTH - MARGIN_X, FOOTER_Y - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLOR.gray);
  doc.text(`Gerado em ${geradoEm}`, MARGIN_X, FOOTER_Y);
  doc.text(
    `Página ${pageAtual} de ${totalPaginas}`,
    PAGE_WIDTH - MARGIN_X,
    FOOTER_Y,
    { align: "right" },
  );
}

/** Garante espaço vertical disponível antes da próxima seção, paginando se necessário. */
function ensureSpace(doc: jsPDF, y: number, altura: number): number {
  if (y + altura <= FOOTER_Y - 8) return y;
  doc.addPage();
  drawHeader(doc);
  return 26;
}

function sectionTitle(doc: jsPDF, texto: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.amber);
  doc.text(texto.toUpperCase(), MARGIN_X, y);
  return y + 5;
}

function fieldBlock(
  doc: jsPDF,
  label: string,
  valor: string,
  x: number,
  y: number,
  larguraMax: number,
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...COLOR.gray);
  doc.text(label.toUpperCase(), x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.darkgray);
  const linhas = doc.splitTextToSize(valor || "—", larguraMax);
  doc.text(linhas, x, y + 5);

  return y + 5 + linhas.length * 5;
}

/**
 * Monta um PDF formatado com os dados do pedido (não é uma captura de tela)
 * e dispara o download diretamente, sem abrir o diálogo de impressão do navegador.
 * O jsPDF só é baixado quando a função é chamada, para não pesar o carregamento inicial da página.
 */
export async function gerarRelatorioPedidoPDF(data: PedidoViewModel): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  drawHeader(doc);

  let y = 26;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLOR.darkgray);
  const nomeLinhas = doc.splitTextToSize(data.nomeCompleto, CONTENT_WIDTH - 40);
  doc.text(nomeLinhas, MARGIN_X, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLOR.gray);
  doc.text(`Protocolo #${data.id}`, PAGE_WIDTH - MARGIN_X, y, {
    align: "right",
  });

  y += nomeLinhas.length * 7 + 2;
  doc.setDrawColor(...COLOR.amber);
  doc.setLineWidth(1);
  doc.line(MARGIN_X, y, MARGIN_X + 20, y);
  y += 10;

  // Situação atual / Data do envio
  y = ensureSpace(doc, y, 20);
  const colWidth = CONTENT_WIDTH / 2 - 4;
  const yStatus = fieldBlock(doc, "Situação Atual", data.statusLabel, MARGIN_X, y, colWidth);
  const yData = fieldBlock(doc, "Data do Envio", data.dataPedido, MARGIN_X + CONTENT_WIDTH / 2 + 4, y, colWidth);
  y = Math.max(yStatus, yData) + 8;

  // Dados pessoais
  y = ensureSpace(doc, y, 25);
  y = sectionTitle(doc, "Dados Pessoais", y);
  const yCpf = fieldBlock(doc, "CPF", data.cpf, MARGIN_X, y, colWidth);
  const yNasc = fieldBlock(doc, "Data de Nascimento", data.dataNascimento, MARGIN_X + CONTENT_WIDTH / 2 + 4, y, colWidth);
  y = Math.max(yCpf, yNasc) + 8;

  // Descrição da solicitação
  const descricaoLinhas = doc.splitTextToSize(`"${data.descricaoProblema}"`, CONTENT_WIDTH);
  y = ensureSpace(doc, y, 14 + descricaoLinhas.length * 5.5);
  y = sectionTitle(doc, "Descrição da Solicitação", y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.darkgray);
  doc.text(descricaoLinhas, MARGIN_X, y + 5);
  y += 5 + descricaoLinhas.length * 5.5 + 8;

  // Contato
  y = ensureSpace(doc, y, 25);
  y = sectionTitle(doc, "Contato", y);
  const yEmail = fieldBlock(doc, "E-mail", data.email, MARGIN_X, y, colWidth);
  const yTel = fieldBlock(doc, "Telefone / WhatsApp", data.telefone, MARGIN_X + CONTENT_WIDTH / 2 + 4, y, colWidth);
  y = Math.max(yEmail, yTel) + 8;

  // Endereço
  const enderecoTexto = data.endereco ?? "Endereço não informado.";
  const enderecoLinhas = doc.splitTextToSize(enderecoTexto, CONTENT_WIDTH);
  y = ensureSpace(doc, y, 10 + enderecoLinhas.length * 5.5);
  y = sectionTitle(doc, "Endereço", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.darkgray);
  doc.text(enderecoLinhas, MARGIN_X, y + 4);
  y += 4 + enderecoLinhas.length * 5.5 + 8;

  // Dentista responsável
  const dentistaTexto = data.dentistaResponsavel ?? "Nenhum dentista atribuído.";
  y = ensureSpace(doc, y, 16);
  y = sectionTitle(doc, "Dentista Responsável", y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...COLOR.darkgray);
  doc.text(dentistaTexto, MARGIN_X, y + 4);

  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    drawFooter(doc, pagina, totalPaginas);
  }

  doc.save(`pedido-${data.id}-relatorio.pdf`);
}
