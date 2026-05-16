import React from "react";

import { Button } from "../Button";
import { Modal } from "../Modal";

import useFetch from "../../../hooks/useFetch";
import { useNotification } from "../../../hooks/useNotification";

type DeleteUserButtonProps = {
  userName: string;
  onConfirm: () => Promise<void>;
};

const DeleteUserButton = ({ userName, onConfirm }: DeleteUserButtonProps) => {
  const [open, setOpen] = React.useState(false);

  const { showNotification } = useNotification();

  const { loading } = useFetch();

  const handleDelete = async () => {
    try {
      await onConfirm();

      setOpen(false);

      showNotification(`${userName} foi excluído com sucesso!`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir.";

      showNotification(msg, "error");
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Deletar
      </Button>

      <Modal open={open} onClose={() => !loading && setOpen(false)}>
        <h2 className="text-2xl font-bold text-darkgray">Confirmar exclusão</h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Tem certeza que deseja excluir <strong>{userName}</strong>? Esta ação
          é permanente e não pode ser desfeita.
        </p>

        <div className="flex gap-3 justify-end mt-8">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="text-[0.8rem] text-center"
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            className="text-[0.8rem] text-center"
          >
            {loading ? "Excluindo..." : "Confirmar exclusão"}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default DeleteUserButton;
