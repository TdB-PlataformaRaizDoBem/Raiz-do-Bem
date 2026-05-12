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
}: {
  cpf: string;
  isAdmin: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) => {
  const { data, loading, error } = useBeneficiario(cpf);
  return (
    <AsyncEstado loading={loading} error={error} vazio={!data}>
      <BeneficiarioDetails data={data!} isAdmin={isAdmin} onClose={onClose} onDeleted={onDeleted} />
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
                {u.programaSocial?.programaLabel ?? "Não informado"}
              </p>
              <p className="text-sm text-gray-500 font-medium">
                <span className="font-bold text-gray uppercase text-xs mr-1">Cidade:</span>
                {u.endereco ? `${u.endereco.cidade} • ${u.endereco.estado}` : "Não informado"}
              </p>
              {u.pedido && (
                <span
                  className={`mt-1 text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                    u.pedido.statusAPI === "APROVADO"
                      ? "bg-green-50 text-green-700"
                      : u.pedido.statusAPI === "REJEITADO"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber/10 text-amber"
                  }`}
                >
                  {u.pedido.statusLabel}
                </span>
              )}
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
          <BeneficiarioPainel cpf={user.cpf} isAdmin={isAdmin} onClose={close} onDeleted={refetch} />
        )}
      />
    </AsyncEstado>
  );
};
