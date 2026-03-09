import { useForm } from 'react-hook-form';
import { Button } from '../../components/ui/Button';
import Input from '../../components/form/Input';
import ImagemLogin from "../../assets/img/imagemLogin.png";
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const { login, loading, authError } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => login(data.username, data.password);

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row font-sans bg-white">
      {/* Lado Esquerdo - Imagem */}
      <section className="hidden lg:block lg:w-1/2 bg-cover bg-center shadow-inner" style={{ backgroundImage: `url(${ImagemLogin})` }} />

      {/* Lado Direito - Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 relative">
        <div className="relative z-10 w-full max-w-[480px]">
          
          <header className="mb-16">
            <h1 className="text-darkgreen font-fredoka text-4xl font-bold mb-4">Turma do Bem</h1>
            <p className="text-gray-400 text-m italic max-w-[400px] border-l-4 p-2 border-orange">
              Gerencie o maior projeto de voluntariado odontológico do mundo e transforme sorrisos.
            </p>
          </header>

          <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-10">Login Administrativo</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {authError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-2 rounded shadow-sm text-red-700 text-xs font-bold">
                {authError}
              </div>
            )}

            <Input 
              label="E-mail"
              placeholder="exemplo@raizdobem.org"
              labelClassName="text-darkgreen text-xs uppercase tracking-widest font-bold"
              {...register("username", { required: "E-mail obrigatório" })}
              error={errors.username?.message as string}
            />

            <Input 
              label="Senha"
              type="password"
              placeholder="••••••••"
              labelClassName="text-darkgreen text-xs uppercase tracking-widest font-bold"
              {...register("password", { required: "Senha obrigatória" })}
              error={errors.password?.message as string}
            />

            <Button type="submit" disabled={loading} className="bg-orange w-full py-4 hover:bg-amber text-white font-bold text-xl rounded-xl shadow-lg mt-6">
              {loading ? "Validando..." : "Entrar no Sistema"}
            </Button>
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