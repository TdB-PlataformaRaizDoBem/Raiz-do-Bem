import React from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { type Beneficiario } from "../../../data/beneficiariosData";
import UpdateBeneficiario from "../../forms/update/UpdateBeneficiario";

type EditBeneficiarioButtonProps = {
  user: Beneficiario;
};

const EditBeneficiarioButton = ({ user }: EditBeneficiarioButtonProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Editar Dados
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <UpdateBeneficiario
          initialData={user} 
          onSuccess={() => setOpen(false)} 
        />
      </Modal>
    </>
  );
};

export default EditBeneficiarioButton;