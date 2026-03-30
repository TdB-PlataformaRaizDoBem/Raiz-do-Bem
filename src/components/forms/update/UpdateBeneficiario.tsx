import { useForm } from "react-hook-form";
import type { Beneficiario } from "../../../data/beneficiariosData";
import { useNotification } from "../../../hooks/useNotification";
import { useCep } from "../../../hooks/useCep";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
 
type UpdateBeneficiarioProps = {
  initialData: Beneficiario;
  onSuccess: () => void;
};
 
// Campos que o usuário pode editar.
// Campos imutáveis (id, cpf, dataNascimento, id_pedido_ajuda, vínculos).
type BeneficiarioEditavel = Pick<
  Beneficiario,
  "nome" | "email" | "telefone" | "sexo" | "programaSocial" |
  "cep" | "logradouro" | "numero" | "cidade" | "estado"
>;
 
const UpdateBeneficiario = ({ initialData, onSuccess }: UpdateBeneficiarioProps) => {
  const { showNotification } = useNotification();
 
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { isDirty, errors },
  } = useForm<BeneficiarioEditavel>({
    defaultValues: {
      nome:          initialData.nome,
      email:         initialData.email,
      telefone:      initialData.telefone,
      sexo:          initialData.sexo,
      programaSocial: initialData.programaSocial,
      cep:           initialData.cep,
      logradouro:    initialData.logradouro,
      numero:        initialData.numero,
      cidade:        initialData.cidade,
      estado:        initialData.estado,
    },
  });
 
  const { buscarCep } = useCep<BeneficiarioEditavel>(setValue, setError, clearErrors);
 
  const watchSexo = watch("sexo");
 
  const onSubmit = (data: BeneficiarioEditavel) => {
    // futura integração: [INTEGRAÇÃO API - ATUALIZAR BENEFICIÁRIO]
    // Enviar apenas os campos editáveis.
 
    showNotification(`Beneficiário(a) ${data.nome} atualizado com sucesso!`, "success");
    onSuccess();
  };
 
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-[85vh] md:h-auto max-w-3xl w-full text-left"
    >
      <h2 className="text-2xl font-bold font-fredoka mb-6 text-darkgray">
        Editar Beneficiário
      </h2>
 
      <div className="flex-1 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
 
        {/* Dados imutáveis — somente leitura, não registrados no form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <Input
            label="CPF"
            name="cpf"
            defaultValue={initialData.cpf}
            readOnly
            className="bg-gray-200 cursor-not-allowed"
          />
          <Input
            label="Data de Nascimento"
            name="dataNascimento"
            defaultValue={initialData.dataNascimento}
            readOnly
            className="bg-gray-200 cursor-not-allowed"
          />
        </div>
 
        {/* Dados editáveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Nome Completo"
            {...register("nome", { required: "Obrigatório" })}
            error={errors.nome?.message}
          />
          <Input
            label="E-mail"
            type="email"
            {...register("email", {
              required: "Obrigatório",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido" },
            })}
            error={errors.email?.message}
          />
          <Input
            label="Telefone"
            {...register("telefone", { required: "Obrigatório" })}
            error={errors.telefone?.message}
          />
 
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-darkgray">Sexo</label>
            <select
              {...register("sexo")}
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
              {...register("programaSocial")}
              className="border border-gray-200 rounded-xl p-3 bg-white outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Turma do Bem">Turma do Bem</option>
              {watchSexo !== "Masculino" && (
                <option value="Apolônias do Bem">Apolônias do Bem</option>
              )}
            </select>
          </div>
        </div>
 
        {/* Endereço com auto-preenchimento via ViaCEP */}
        <div className="border-t pt-4">
          <h3 className="font-bold text-darkgray mb-4 font-fredoka">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CEP"
                {...register("cep", {
                  required: "Obrigatório",
                  pattern: { value: /^\d{5}-?\d{3}$/, message: "CEP inválido" },
                  onBlur: (e) => buscarCep(e.target.value),
                })}
                error={errors.cep?.message}
              />
              <Input
                label="Número"
                {...register("numero", { required: "Obrigatório" })}
                error={errors.numero?.message}
              />
            </div>
            <Input
              label="Logradouro"
              {...register("logradouro")}
              readOnly
              className="bg-gray-100"
            />
            <Input
              label="Cidade"
              {...register("cidade")}
              readOnly
              className="bg-gray-100"
            />
            <Input
              label="Estado"
              {...register("estado")}
              readOnly
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>
 
      <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
        <Button variant="secondary" type="button" onClick={onSuccess}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!isDirty}
          className={!isDirty ? "opacity-50 cursor-not-allowed" : ""}
        >
          {isDirty ? "Salvar Alterações" : "Sem mudanças"}
        </Button>
      </div>
    </form>
  );
};
 
export default UpdateBeneficiario;