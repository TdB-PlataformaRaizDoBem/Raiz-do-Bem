import { UserManagementPage } from "../../components/UserManagement.tsx/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { CreateBeneficiario } from "../../components/forms/create/CreateBeneficiario";
import { BeneficiarioDetails } from "../../components/details/BeneficiarioDetails";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { useBeneficiarios, useBeneficiario } from "../../hooks/useBeneficiarios";
import type { BeneficiarioCompleto } from "../../services/Beneficiarioservice";
import { getUser } from "../../hooks/useUser";
import { beneficiarioFilterConfig } from "../../hooks/pageFilterConfigs";

const BeneficiarioPainel = ({
  cpf,
  isAdmin,
  onClose,
  onDeleted,
  onUpdated, // <--- Adicionado
}: {
  cpf: string;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void; // <--- Adicionado
}) => {
  // Desestruturado a função 'refetch' nativa do hook e renomeada para refetchSingle
  const { data, loading, error, refetch: refetchSingle } = useBeneficiario(cpf);

  return (
    <AsyncEstado loading={loading} error={error} vazio={!data}>
      <BeneficiarioDetails 
        data={data!} 
        isAdmin={isAdmin} 
        onClose={onClose} 
        onDeleted={onDeleted} 
        onUpdated={() => {
          onUpdated(); // Recarrega a listagem de cards ao fundo
          if (refetchSingle) refetchSingle(); // Atualiza a gaveta de visualização atual
        }}
      />
    </AsyncEstado>
  );
};

export const Beneficiarios = () => {
  const loggedUser = getUser();
  const isAdmin = loggedUser?.role === "admin";
  const { data: beneficiarios, loading, error, refetch } = useBeneficiarios();

  return (
    <AsyncEstado loading={loading} error={error} vazio={!beneficiarios?.length} mensagemVazio="Nenhum beneficiário cadastrado.">
      <UserManagementPage<BeneficiarioCompleto>
        title="Gerenciamento de Beneficiários"
        users={beneficiarios ?? []}
        getId={(u) => u.id}
        filterConfig={beneficiarioFilterConfig}
        renderCreateForm={(close) => <CreateBeneficiario onSuccess={close} />}
        renderCard={(u, selected, select) => (
          <UserCard className={`transition-all border-l-4 border-amber p-5 ${selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"}`}>
            <div className="flex flex-col gap-2">
              <p className="text-xl font-bold text-darkgray leading-tight">{u.nomeCompleto}</p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray uppercase text-xs mr-1">Programa:</span>
                {u.programaSocial ?? "Não informado"}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray uppercase text-xs mr-1">Cidade:</span>
                {u.endereco ? `${u.endereco.cidade} • ${u.endereco.estado}` : "Não informado"}
              </p>
            </div>
            <div className="mt-4 pt-4 flex flex-col gap-6">
              <span className="text-xs font-black lg:text-end border-t border-gray/10 pt-4 lg:border-t-0 uppercase text-gray-400 tracking-widest">
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
          <BeneficiarioPainel 
            cpf={user.cpf} 
            isAdmin={isAdmin} 
            onClose={close} 
            onDeleted={refetch} 
            onUpdated={refetch} // <--- Passando o trigger de atualização aqui
          />
        )}
      />
    </AsyncEstado>
  );
};