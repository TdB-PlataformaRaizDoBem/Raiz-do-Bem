// CreateDentistaForms.tsx
import { useFormContext } from "react-hook-form";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { type Dentista } from "../../../data/dentistasData";
import { useCep } from "../../../hooks/useCep";

const REGEX = {
  nome: /^[A-Za-zÀ-ÿ\s]{3,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefone: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
  cro: /^\d{2,6}-[A-Z]{2}$/i,
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
  } = useFormContext<Omit<Dentista, "id" | "sexo" | "especialidades"> & {
    sexo: "Masculino" | "Feminino" | "Outro";
    especialidades: string;
  }>();

  const { buscarCep } = useCep(setValue, setError, clearErrors);
  const requiredMsg = "Campo obrigatório";

  return (
    <div className="flex flex-col max-h-[90vh] w-full">
      <h2 className="text-xl font-bold text-darkgray border-b pb-3">Cadastrar Dentista</h2>

      <div className="flex-1 overflow-y-auto p-2 pr-3 custom-scrollbar space-y-6">
        {/* Dados Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome Completo"
            {...register("nome", { required: requiredMsg, pattern: { value: REGEX.nome, message: "Nome inválido" } })}
            error={errors.nome?.message}
          />

          <Input
            label="CRO"
            {...register("cro", { required: requiredMsg, pattern: { value: REGEX.cro, message: "Formato inválido (12345-SP)" } })}
            error={errors.cro?.message}
          />

          <Input
            label="CPF"
            {...register("cpf", { required: requiredMsg, pattern: { value: REGEX.cpf, message: "CPF inválido" } })}
            error={errors.cpf?.message}
          />

          <Input
            label="Email"
            {...register("email", { required: requiredMsg, pattern: { value: REGEX.email, message: "Email inválido" } })}
            error={errors.email?.message}
          />

          <Input
            label="Telefone"
            {...register("telefone", { required: requiredMsg, pattern: { value: REGEX.telefone, message: "Telefone inválido" } })}
            error={errors.telefone?.message}
          />

          <Input
            label="Especialidades (separadas por vírgula)"
            {...register("especialidades", { required: requiredMsg, minLength: { value: 3, message: "Mínimo 3 caracteres" } })}
            error={errors.especialidades?.message}
          />

          <div className="flex flex-col">
            <label className="text-sm font-bold">Sexo</label>
            <select {...register("sexo")} className="p-3 border rounded-md">
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold">Programa</label>
            <select {...register("programa")} className="p-3 border rounded-md">
              <option value="Turma do Bem">Turma do Bem</option>
              <option value="Apolônias do Bem">Apolônias do Bem</option>
              <option value="Ambos">Ambos</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-bold">Disponibilidade</label>
            <select {...register("disponibilidade")} className="p-3 border rounded-md">
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
        </div>

        {/* Endereço */}
        <div className="border-t pt-4">
          <h3 className="font-bold mb-4">Endereço do Consultório</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CEP"
              {...register("endereco.cep", { required: requiredMsg, pattern: { value: REGEX.cep, message: "CEP inválido" }, onBlur: (e) => buscarCep(e.target.value) })}
              error={errors.endereco?.cep?.message}
            />

            <Input
              label="Número"
              {...register("endereco.numero", { required: requiredMsg })}
              error={errors.endereco?.numero?.message}
            />

            <Input label="Logradouro" {...register("endereco.logradouro")} readOnly className="bg-gray-100" />
            <Input label="Cidade" {...register("endereco.cidade")} readOnly className="bg-gray-100" />
            <Input label="Estado" {...register("endereco.estado")} readOnly className="bg-gray-100" />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={!isDirty} className={`${!isDirty && "opacity-50 cursor-not-allowed"}`}>Cadastrar</Button>
      </div>
    </div>
  );
};