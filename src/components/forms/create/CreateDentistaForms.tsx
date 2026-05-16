// CreateDentistaForms.tsx
import { useFormContext } from "react-hook-form";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { type DentistaFormValues } from "./CreateDentista";
import { useCep } from "../../../hooks/useCep";

const REGEX = {
  nome: /^[A-Za-zÀ-ÿ\s]{3,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefone: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
  cro: /^(CRO[-/ ]?)?[A-Za-z]{2}[-/ ]?\d{4,7}$|^\d{4,7}[-/ ]?[A-Za-z]{2}$/,
  cep: /^\d{5}-?\d{3}$/,
};

interface Props {
  onCancel: () => void;
}

export const CreateDentistaForm = ({ onCancel }: Props) => {
  const {
    register,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useFormContext<DentistaFormValues>();

  const { buscarCep } = useCep(setValue, setError, clearErrors);
  const requiredMsg = "Campo obrigatório";

  return (
    <div className="flex flex-col max-h-[90vh] w-full">
      <h2 className="text-xl font-bold text-darkgray border-b pb-3">
        Cadastrar Dentista
      </h2>

      <div className="flex-1 overflow-y-auto p-2 pr-3 custom-scrollbar space-y-6">

        {/* Dados Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            {...register("nomeCompleto", {
              required: requiredMsg,
              pattern: { value: REGEX.nome, message: "Nome inválido" },
            })}
            error={errors.nomeCompleto?.message}
          />

          <Input
            label="CRO"
            {...register("croDentista", {
              required: requiredMsg,
              pattern: { value: REGEX.cro, message: "Formato inválido (SP-12345)" },
            })}
            error={errors.croDentista?.message}
          />

          <Input
            label="CPF"
            {...register("cpf", {
              required: requiredMsg,
              pattern: { value: REGEX.cpf, message: "CPF inválido" },
            })}
            error={errors.cpf?.message}
          />

          <Input
            label="Email"
            {...register("email", {
              required: requiredMsg,
              pattern: { value: REGEX.email, message: "Email inválido" },
            })}
            error={errors.email?.message}
          />

          <Input
            label="Telefone"
            {...register("telefone", {
              required: requiredMsg,
              pattern: { value: REGEX.telefone, message: "Telefone inválido" },
            })}
            error={errors.telefone?.message}
          />

          {/* SEXO */}
          <div className="flex flex-col">
            <label className="text-sm font-bold">Sexo</label>
            <select
              {...register("sexo", { required: requiredMsg })}
              className="p-3 border rounded-md"
            >
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* 🔥 NOVO CAMPO: CATEGORIA (OBRIGATÓRIO BACKEND) */}
          <div className="flex flex-col">
            <label className="text-sm font-bold">Categoria</label>
            <select
              {...register("categoria", { required: requiredMsg })}
              className="p-3 border rounded-md"
            >
              <option value="DENTISTA">Dentista</option>
              <option value="COORDENADOR">Coordenador</option>
            </select>
            {errors.categoria && (
              <span className="text-red-500 text-sm">
                {errors.categoria.message}
              </span>
            )}
          </div>

          {/* Disponibilidade */}
          <div className="flex flex-col">
            <label className="text-sm font-bold">Disponibilidade</label>
            <select
              {...register("disponivel", { required: requiredMsg })}
              className="p-3 border rounded-md"
            >
              <option value="S">Sim</option>
              <option value="N">Não</option>
            </select>
          </div>
        </div>

        {/* Endereço */}
        <div className="border-t pt-4">
          <h3 className="font-bold mb-4">Endereço do Consultório</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CEP"
              {...register("endereco.cep", {
                required: requiredMsg,
                pattern: { value: REGEX.cep, message: "CEP inválido" },
                onBlur: (e) => buscarCep(e.target.value),
              })}
            />

            <Input
              label="Número"
              {...register("endereco.numero", {
                required: requiredMsg,
              })}
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          disabled={!isDirty}
          className={`${!isDirty && "opacity-50 cursor-not-allowed"}`}
        >
          Cadastrar
        </Button>
      </div>
    </div>
  );
};