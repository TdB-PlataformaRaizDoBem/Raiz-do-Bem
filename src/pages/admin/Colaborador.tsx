import React from "react";
import { UserManagementPage } from "../../components/UserManagement/UserManagementPage";
import UserCard from "../../components/userCard/UserCard";
import { Button } from "../../components/ui/Button";
import { CreateCoord } from "../../components/forms/create/CreateCoord";
import { ColaboradorDetails } from "../../components/details/ColaboradorDetails";
import { AsyncEstado } from "../../components/ui/AsyncEstado";
import { useColaboradores, useColaborador } from "../../hooks/useColaboradores";
import { type ColaboradorCompleto } from "../../services/ColaboradorService";
import { colaboradorFilterConfig } from "../../hooks/pageFilterConfigs";

const ColaboradorPainel = ({
  id,
  onClose,
  onDeleted,
  onUpdated,
}: {
  id: number;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}) => {
  const { data, loading, error, refetch: refetchSingle } = useColaborador(id);
  if (!loading && !error && !data) return null;
  return (
    <AsyncEstado loading={loading} error={error}>
      <ColaboradorDetails
        data={data!}
        onClose={onClose}
        onDeleted={onDeleted}
        onUpdated={() => {
          onUpdated();
          if (refetchSingle) refetchSingle();
        }}
      />
    </AsyncEstado>
  );
};

export default function Colaborador() {
  const { data: colaboradores, loading, error, refetch } = useColaboradores();

  // useCallback estabiliza a referência entre re-renders do componente pai.
  // Como renderCard usa apenas os parâmetros recebidos (u, selected, select)
  // e não captura estado externo, o array de deps é vazio.
  // Isso permite que CardSlot dentro de UserManagementPage pule o re-render
  // de itens que não mudaram (ex.: busca que reduz a lista mas mantém o item).
  const renderCard = React.useCallback(
    (u: ColaboradorCompleto, selected: boolean, select: () => void) => (
      <UserCard
        className={`transition-all border-l-4 border-lightgreen p-5 ${
          selected ? "shadow-md scale-[1.02] bg-gray-50" : "hover:shadow-sm"
        }`}
      >
        <div className="flex flex-col gap-2">
          <p className="text-xl font-bold text-darkgray leading-tight">
            {u.nomeCompleto}
          </p>
          <p className="text-sm text-gray-500 font-medium mb-2">{u.email}</p>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs lg:text-end font-black uppercase text-gray-400 tracking-widest">
            ID: #{u.id}
          </span>
          <Button
            onClick={select}
            variant={selected ? "primary" : "secondary"}
            className="w-full lg:w-auto py-2 px-6 text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            Visualizar Perfil
          </Button>
        </div>
      </UserCard>
    ),
    [],
  );

  const renderCreateForm = React.useCallback(
    (close: () => void) => (
      <CreateCoord
        onSuccess={() => {
          refetch();
          close();
        }}
      />
    ),
    [refetch],
  );

  const renderDetails = React.useCallback(
    (user: ColaboradorCompleto, close: () => void) => (
      <ColaboradorPainel
        id={user.id}
        onClose={close}
        onDeleted={refetch}
        onUpdated={refetch}
      />
    ),
    [refetch],
  );

  return (
    <AsyncEstado loading={loading} error={error}>
      <UserManagementPage<ColaboradorCompleto>
        title="Gerenciamento de Colaboradores"
        users={colaboradores ?? []}
        getId={(u) => u.id}
        filterConfig={colaboradorFilterConfig}
        renderCard={renderCard}
        renderCreateForm={renderCreateForm}
        renderDetails={renderDetails}
      />
    </AsyncEstado>
  );
}
