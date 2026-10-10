import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MapaVulnerabilidade from '../../pages/vulnerabilidade/MapaVulnerabilidade';

// O mapa tem testes próprios (vulnerabilityMap.test.tsx): aqui basta saber que a página o monta.
vi.mock('../../components/vulnerabilityMap/VulnerabilityMap', () => ({
  VulnerabilityMap: () => <section aria-label="Mapa de vulnerabilidade social" />,
}));

describe('página /admin/mapa', () => {
  it('monta o mapa de vulnerabilidade', () => {
    render(<MapaVulnerabilidade />);

    expect(screen.getByRole('region', { name: 'Mapa de vulnerabilidade social' })).toBeInTheDocument();
  });
});
