/**
 * Página /admin/mapa — Mapa de Vulnerabilidade Social e Demanda Odontológica.
 *
 * Export default para permitir `lazy()` em Admin.tsx, como nas demais páginas.
 * O peso do Leaflet (~45 KB gzip) fica isolado neste chunk: quem nunca abre o
 * mapa não paga por ele.
 */

import { VulnerabilityMap } from "../../components/vulnerabilityMap/VulnerabilityMap";

const MapaVulnerabilidade = () => (
  <div>
    <VulnerabilityMap />
  </div>
);

export default MapaVulnerabilidade;
