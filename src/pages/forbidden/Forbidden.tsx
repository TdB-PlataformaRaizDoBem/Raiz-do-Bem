import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Forbidden = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardPath =
    user?.role === 'ADMIN' ? '/admin/dashboard' : '/coord/dashboard';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-8 text-center">
      <span className="text-7xl font-fredoka font-bold text-orange mb-2">403</span>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Acesso Negado</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Você não tem permissão para acessar esta página. Se acredita que isso é
        um erro, entre em contato com o administrador do sistema.
      </p>
      <button
        onClick={() => navigate(dashboardPath, { replace: true })}
        className="bg-darkgreen text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
      >
        Voltar ao Dashboard
      </button>
    </main>
  );
};

export default Forbidden;
