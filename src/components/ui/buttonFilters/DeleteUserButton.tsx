import React from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { useNotification } from "../../../hooks/useNotification";

type DeleteUserButtoProps = {
  userId: number;
  userName: string;
  onDelete: (id: number) => void;
};

const DeleteUserButton = ({
  userId,
  userName,
  onDelete,
}: DeleteUserButtoProps) => {
  const [open, setOpen] = React.useState(false);
  const { showNotification } = useNotification();

  const handleDelete = () => {
    setOpen(false);
    onDelete?.(userId);
    showNotification(`Usuário ${userName} foi deletado com sucesso!`);
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Deletar
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-2xl font-bold text-darkgray">Confirmar exclusão</h2>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Tem certeza que deseja excluir o usuário <strong>{userName}</strong>?
          Esta ação removerá todos os acessos vinculados a este perfil.
        </p>

        <div className="flex gap-3 justify-end mt-8">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            className="text-[0.8rem] text-center"
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            className="text-[0.8rem] text-center"
          >
            Confirmar exclusão
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default DeleteUserButton;
