import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../components/formElements/Input';

describe('Input', () => {
  it('associa o label ao campo', () => {
    render(<Input label="E-mail" name="email" />);

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });

  it('mostra a mensagem de erro e marca o campo como inválido', () => {
    render(<Input label="E-mail" name="email" error="Formato de e-mail inválido" />);

    const campo = screen.getByLabelText('E-mail');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Formato de e-mail inválido');
    expect(screen.getByRole('alert')).toHaveTextContent('Formato de e-mail inválido');
  });

  describe('botão de mostrar/ocultar senha', () => {
    it('não aparece por padrão, mesmo em campo de senha', () => {
      render(<Input label="Senha" name="senha" type="password" />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('não aparece em campos que não são de senha', () => {
      render(<Input label="E-mail" name="email" type="email" showPasswordToggle />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('alterna entre ocultar e mostrar o texto', async () => {
      render(<Input label="Senha" name="senha" type="password" showPasswordToggle />);
      const campo = screen.getByLabelText('Senha');
      expect(campo).toHaveAttribute('type', 'password');

      await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
      expect(campo).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: 'Ocultar senha' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
      expect(campo).toHaveAttribute('type', 'password');
    });

    it('não envia o formulário ao clicar (type=button) e preserva o valor digitado', async () => {
      let enviado = false;
      render(
        <form onSubmit={(e) => { e.preventDefault(); enviado = true; }}>
          <Input label="Senha" name="senha" type="password" showPasswordToggle />
        </form>,
      );

      await userEvent.type(screen.getByLabelText('Senha'), 'segredo123');
      await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));

      expect(enviado).toBe(false);
      expect(screen.getByLabelText('Senha')).toHaveValue('segredo123');
    });
  });
});
