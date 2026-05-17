import React from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import type { DentistaViewModel } from "../../../domain/mappers/DentistaMapper";
import UpdateDentista from "../../forms/update/UpdateDentista";

type EditDentistaButtonProps = {
  user: DentistaViewModel;
  onUpdated: () => void;
};

const EditDentistaButton = ({ user, onUpdated }: EditDentistaButtonProps) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        className="flex-1 md:flex-none"
      >
        Editar Dados
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <UpdateDentista 
          initialData={user} 
          onSuccess={() => {
            setOpen(false);
            onUpdated(); 
          }} 
        />
      </Modal>
    </>
  );
};

export default EditDentistaButton;