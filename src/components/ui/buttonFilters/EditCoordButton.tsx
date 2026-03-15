import React from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import UpdateCoord from "../../forms/UpdateCoord";
import { type Coordenador } from "../../../data/coordenadoresData";

type EditCoordButtonProps = {
  user: Coordenador;
};

const EditCoordButton = ({ user }: EditCoordButtonProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Editar Dados
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <UpdateCoord 
          initialData={user} 
          onSuccess={() => setOpen(false)} 
        />
      </Modal>
    </>
  );
};

export default EditCoordButton;