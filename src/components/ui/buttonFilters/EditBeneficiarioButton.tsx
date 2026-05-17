import React from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import type { BeneficiarioViewModel } from "../../../domain/mappers/Beneficiariomapper";
import UpdateBeneficiario from "../../forms/update/UpdateBeneficiario";

type EditBeneficiarioButtonProps = {
  user: BeneficiarioViewModel;
  onUpdated: () => void;
};

export const EditBeneficiarioButton = ({ user, onUpdated }: EditBeneficiarioButtonProps) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Editar Dados
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <UpdateBeneficiario 
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

export default EditBeneficiarioButton;