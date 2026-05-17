import React from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import UpdateCoord from "../../forms/update/UpdateCoord";
import type { ColaboradorViewModel } from "../../../domain/mappers/ColaboradorMapper";

type EditCoordButtonProps = {
  user: ColaboradorViewModel;
  onUpdated: () => void; // <--- Adicionado na tipagem do botão
};

const EditCoordButton = ({ user, onUpdated }: EditCoordButtonProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Editar Dados
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <UpdateCoord 
          initialData={user} 
          onSuccess={() => {
            setOpen(false); // Fecha o modal de edição
            onUpdated();    // Dispara a revalidação dos dados do back
          }} 
        />
      </Modal>
    </>
  );
};

export default EditCoordButton;
