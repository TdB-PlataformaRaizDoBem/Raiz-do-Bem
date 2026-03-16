import React from 'react';
import type { Beneficiario } from '../../../data/beneficiariosData';
import { useNotification } from '../../../hooks/useNotification';
import Input from '../../formElements/Input';
import { Button } from '../../ui/Button';

type UpdateBeneficiarioProps = {
  initialData: Beneficiario;
  onSuccess: () => void;
};

const UpdateBeneficiario = ({ initialData, onSuccess }: UpdateBeneficiarioProps) => {
  const [formData, setFormData] = React.useState<Beneficiario>(initialData);
  const { showNotification } = useNotification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification(`Beneficiário(a) ${formData.nome} atualizado com sucesso!`);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[85vh] md:h-auto max-w-3xl w-full text-left">
      <h2 className="text-2xl font-bold font-fredoka mb-6 text-darkgray">
        Editar Beneficiário
      </h2>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input 
            label="Nome Completo" 
            name="nome" 
            value={formData.nome} 
            onChange={handleChange} 
          />
          <Input 
            label="CPF" 
            name="cpf" 
            value={formData.cpf} 
            disabled
          />
          <Input 
            label="E-mail" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
          />
          <Input 
            label="Telefone" 
            name="telefone" 
            value={formData.telefone} 
            onChange={handleChange} 
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-darkgray">Sexo</label>
            <select 
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              className="border border-gray-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-darkgray">Programa</label>
            <select 
              name="programa"
              value={formData.programa}
              onChange={handleChange}
              className="border border-gray-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Turma do Bem">Turma do Bem</option>
              {formData.sexo !== "Masculino" && (
                <option value="Apolônias do Bem">Apolônias do Bem</option>
              )}
            </select>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-darkgray mb-4 font-fredoka">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="CEP" name="cep" value={formData.cep} onChange={handleChange} />
              <Input label="Número" name="numero" value={formData.numero} onChange={handleChange} />
            </div>
            <Input label="Logradouro" name="logradouro" value={formData.logradouro} onChange={handleChange} />
            <Input label="Cidade" name="cidade" value={formData.cidade} onChange={handleChange} />
            <Input label="Estado" name="estado" value={formData.estado} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
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

export default UpdateBeneficiario;