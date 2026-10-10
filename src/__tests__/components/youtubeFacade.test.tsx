import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { YouTubeFacade } from '../../components/media/YouTubeFacade';

// A Política de Privacidade promete que o YouTube só é acionado depois de apertar play.
describe('YouTubeFacade', () => {
  it('antes do clique mostra só um botão com a miniatura: nenhum iframe do YouTube', () => {
    const { container } = render(<YouTubeFacade videoId="abc123" title="Vídeo institucional" />);

    expect(screen.getByRole('button', { name: 'Assistir ao vídeo: Vídeo institucional' })).toBeInTheDocument();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('sem miniatura própria, usa a miniatura pública do YouTube', () => {
    const { container } = render(<YouTubeFacade videoId="abc123" title="Vídeo" />);

    expect(container.querySelector('img')).toHaveAttribute('src', 'https://i.ytimg.com/vi/abc123/hqdefault.jpg');
  });

  it('com miniatura local, não pede nada ao YouTube antes do clique', () => {
    const { container } = render(<YouTubeFacade videoId="abc123" title="Vídeo" thumbnail="/local.webp" />);

    expect(container.querySelector('img')).toHaveAttribute('src', '/local.webp');
  });

  it('depois do clique carrega o player pelo domínio sem cookies até a reprodução', async () => {
    const { container } = render(<YouTubeFacade videoId="abc123" title="Vídeo institucional" className="extra" />);

    await userEvent.click(screen.getByRole('button'));

    const player = container.querySelector('iframe')!;
    expect(player).toHaveAttribute('src', expect.stringContaining('https://www.youtube-nocookie.com/embed/abc123'));
    expect(player).toHaveAttribute('title', 'Vídeo institucional');
    expect(player).toHaveClass('extra');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
