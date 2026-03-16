import React from "react";
import type { Coordenador } from "../../../data/coordenadoresData";
import { useNotification } from "../../../hooks/useNotification";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";

type UpdateCoordProps = {
  initialData: Coordenador;
  onSuccess: () => void;
};

const UpdateCoord = ({ initialData, onSuccess }: UpdateCoordProps) => {
  const [formData, setFormData] = React.useState<Coordenador>(initialData);
  const { showNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //useFetch futuramente aqui

    showNotification(`Coordenador(a) ${formData.nome} atualizado com sucesso!`);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-center font-fredoka mb-2">
        Editar Coordenador
      </h2>

      <div className="flex flex-col gap-3">
        <Input
          label="Nome Completo"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="CEP"
            name="cep"
            value={formData.cep}
            onChange={handleChange}
          />
          <Input
            label="Número"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Logradouro"
          name="logradouro"
          value={formData.logradouro}
          onChange={handleChange}
        />
      </div>

      <div className="flex gap-3 justify-end mt-4">
        <Button variant="secondary" type="button" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default UpdateCoord;
