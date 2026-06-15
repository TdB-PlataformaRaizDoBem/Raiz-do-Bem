import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import Input from '../../components/formElements/Input';
import ImagemLogin from '../../assets/img/imagemLogin.png';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormValues {
  email: string;
  senha: string;
}

const AUTH_ERROR_MSG = 'Credenciais inválidas. Verifique seu e-mail e senha.';

const Login = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: 'onBlur' });

  const onSubmit = async ({ email, senha }: LoginFormValues): Promise<void> => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      await login(email, senha);
    } catch (err) {
      // Qualquer erro → mensagem genérica (OWASP A07)
      if (import.meta.env.DEV) {
        console.error('[Login] Falha na autenticação:', err);
      }
      setAuthError(AUTH_ERROR_MSG);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-white">
      {/* Imagem lateral decorativa */}
      <section
        aria-hidden="true"
        className="hidden lg:block lg:w-1/2 bg-cover bg-center shadow-inner"
        style={{ backgroundImage: `url(${ImagemLogin})` }}
      />

      {/* Formulário de login */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        <div className="relative z-10 w-full max-w-[480px]">

          <header className="mb-16">
            <h1 className="text-darkgreen font-fredoka text-4xl font-bold mb-4">
              Turma do Bem
            </h1>
            <p className="text-gray-400 text-m italic max-w-[400px] border-l-4 p-2 border-orange">
              Gerencie o maior projeto de voluntariado odontológico do mundo e
              transforme sorrisos.
            </p>
          </header>

          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-10">
            Login Administrativo
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Banner de erro — aparece apenas após falha */}
            {authError && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-50 border-l-4 border-red-500 p-3 mb-2 rounded shadow-sm text-red-700 text-xs font-bold"
              >
                {authError}
              </div>
            )}

            <Input
              label="E-mail"
              type="email"
              placeholder="exemplo@turmadobem.org"
              autoComplete="email"
              labelClassName="text-darkgreen text-xs uppercase tracking-widest font-bold"
              {...register('email', {
                required: 'E-mail obrigatório',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Formato de e-mail inválido',
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              labelClassName="text-darkgreen text-xs uppercase tracking-widest font-bold"
              {...register('senha', {
                required: 'Senha obrigatória',
                minLength: { value: 3, message: 'Senha muito curta' },
              })}
              error={errors.senha?.message}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange w-full hover:bg-amber text-white font-bold text-xl rounded-xl shadow-lg mt-6 p-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Validando...' : 'Entrar no Sistema'}
            </Button>

            <Link
              to="/"
              className="rounded-lg font-semibold transition-all duration-300 min-w-0
                         bg-red-500 text-white hover:bg-red-600 text-center p-3"
            >
              Voltar ao Início
            </Link>
          </form>

          <footer className="mt-24 text-center text-gray-300 text-[10px] uppercase tracking-[0.2em]">
            © 2026 Turma do Bem | Projeto Raiz do Bem
          </footer>
        </div>
      </section>
    </main>
  );
};

export default Login;
