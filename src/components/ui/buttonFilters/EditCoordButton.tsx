import React from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import UpdateCoord from "../../forms/update/UpdateCoord";
import { type Colaborador } from "../../../data/colaboradorData";

type EditCoordButtonProps = {
  user: Colaborador;
};

const EditCoordButton = ({ user }: EditCoordButtonProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Editar Dados
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <UpdateCoord initialData={user} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
};

export default EditCoordButton;
