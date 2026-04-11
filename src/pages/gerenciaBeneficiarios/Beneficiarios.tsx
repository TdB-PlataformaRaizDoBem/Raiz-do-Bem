import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { CreateBeneficiario } from "../../components/forms/create/CreateBeneficiario";
import { BeneficiarioDetails } from "../../components/details/BeneficiarioDetails";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { useBeneficiarios, useBeneficiario } from "../../hooks/useBeneficiarios";
import type { BeneficiarioCompleto } from "../../services/Beneficiarioservice";
import { getUser } from "../../hooks/useUser";
 
// ---------------------------------------------------------------------------
// Painel de detalhe isolado — tem seu próprio ciclo de fetch por id.
// Evita recarregar a lista inteira quando só o detalhe muda.
// ---------------------------------------------------------------------------
const BeneficiarioPainel = ({
  id,
  isAdmin,
  onClose,
}: {
  id: number;
  isAdmin: boolean;
  onClose: () => void;
}) => {
  const { data, loading, error } = useBeneficiario(id);
 
  return (
    <AsyncEstado loading={loading} error={error} vazio={!data}>
      <BeneficiarioDetails data={data!} isAdmin={isAdmin} onClose={onClose} />
    </AsyncEstado>
  );
};
 
// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
export const Beneficiarios = () => {
  const loggedUser = getUser();
  const isAdmin = loggedUser?.role === "admin";
  const { data: beneficiarios, loading, error } = useBeneficiarios();
 
  return (
    <AsyncEstado
      loading={loading}
      error={error}
      vazio={!beneficiarios?.length}
      mensagemVazio="Nenhum beneficiário cadastrado."
    >
      <UserManagementPage<BeneficiarioCompleto>
        title="Gerenciamento de Beneficiários"
        users={beneficiarios ?? []}
        getId={(u) => u.id}
        renderCreateForm={(close) => <CreateBeneficiario onSuccess={close} />}
        renderCard={(u, selected, select) => (
          <UserCard
            className={`transition-all border-l-4 border-amber p-5
              ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}
          >
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold text-darkgray leading-tight">{u.nome}</p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray uppercase text-xs mr-1">Programa:</span>
                {u.programaSocial}
              </p>
            </div>
            <div className="mt-4 pt-4 flex flex-col gap-6">
              <span className="text-xs font-black sm:text-end uppercase text-gray-400 tracking-widest">
                ID: #{u.id}
              </span>
              <Button
                onClick={select}
                variant={selected ? "primary" : "secondary"}
                className="w-full lg:w-auto py-2 px-6 text-xs font-bold shadow-sm active:scale-95 transition-transform"
              >
                Visualizar Detalhes
              </Button>
            </div>
          </UserCard>
        )}
        renderDetails={(user, close) => (
          <BeneficiarioPainel id={user.id} isAdmin={isAdmin} onClose={close} />
        )}
      />
    </AsyncEstado>
  );
};