/**
 * UpdateBeneficiario.tsx
 *
 * Formulário de edição de Beneficiário — refatorado para ViewModel.
 *
 * ALTERAÇÕES vs. versão anterior:
 *   - initialData agora é BeneficiarioViewModel (não mais o tipo Beneficiario do mock)
 *   - Campo "nome" → "nomeCompleto"
 *   - Campo "sexo" removido (não existe em Beneficiario.java)
 *   - Endereço: campos planos → objeto aninhado "endereco.*" (reflete back-end)
 *   - Campo "programaSocial" aceita string (vem do mapper como string)
 *   - onSubmit monta payload correto para PUT /beneficiario/:cpf
 *   - useCep atualizado para escrever em "endereco.cidade", "endereco.estado", etc.
 */

import { useForm } from "react-hook-form";
import type { BeneficiarioViewModel } from "../../../domain/mappers/Beneficiariomapper";
import { atualizarBeneficiario } from "../../../services/Beneficiarioservice";
import { useNotification } from "../../../hooks/useNotification";
import { useCep } from "../../../hooks/useCep";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";

type UpdateBeneficiarioProps = {
  initialData: BeneficiarioViewModel;
  onSuccess: () => void;
};


type BeneficiarioEditavel = {
  nomeCompleto: string;      
  email: string;
  telefone: string;
  programaSocial: string;      
  "endereco.cep": string;
  "endereco.numero": string;
  "endereco.logradouro": string;
  "endereco.cidade": string;
  "endereco.estado": string;
};

const UpdateBeneficiario = ({ initialData, onSuccess }: UpdateBeneficiarioProps) => {
  const { showNotification } = useNotification();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { isDirty, errors },
  } = useForm<BeneficiarioEditavel>({
    defaultValues: {
      nomeCompleto: initialData.nomeCompleto,
      email: initialData.email,
      telefone: initialData.telefone,
      programaSocial: initialData.programaSocial,
      "endereco.cep": initialData.endereco?.cep ?? "",
      "endereco.numero": initialData.endereco?.numero ?? "",
      "endereco.logradouro": initialData.endereco?.logradouro ?? "",
      "endereco.cidade": initialData.endereco?.cidade ?? "",
      "endereco.estado": initialData.endereco?.estado ?? "",
    },
  });

  const { buscarCep } = useCep<BeneficiarioEditavel>(setValue, setError, clearErrors);

  const onSubmit = async (data: BeneficiarioEditavel) => {
    try {
      await atualizarBeneficiario(initialData.cpf, {
        nomeCompleto: data.nomeCompleto,
        email: data.email,
      });
      showNotification(`${data.nomeCompleto} atualizado com sucesso!`, "success");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar";
      showNotification(msg, "error");
    }
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

        {/* Dados imutáveis — somente leitura */}
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
            {...register("nomeCompleto", { required: "Obrigatório" })}
            error={errors.nomeCompleto?.message}
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

          <Input
            label="Programa Social (somente leitura)"
            defaultValue={initialData.programaSocial}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-bold text-darkgray mb-4 font-fredoka">Endereço</h3>

          {/*
           * NOTA SOBRE ENDEREÇO:
           * O back-end cria o Endereço via POST /endereco (CEP + número + tipoEndereco)
           * e retorna o objeto completo com id. O PUT /beneficiario/:cpf recebe idEndereco.
           * Logo o fluxo correto é:
           *   1. Usuário digita novo CEP + número
           *   2. Front chama POST /endereco para criar novo registro
           *   3. Usa o id retornado no payload do PUT /beneficiario
           *
           * Enquanto o endpoint PUT /beneficiario não aceita body, apenas exibimos
           * os campos com aviso de funcionalidade pendente.
           */}
          <div className="mb-3 p-3 bg-amber/5 border border-amber/20 rounded-lg">
            <p className="text-xs text-amber font-bold">
              ⚠ Atualização de endereço depende de implementação do PUT /beneficiario no back-end.
              Os campos abaixo serão enviados quando disponível.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="CEP"
                {...register("endereco.cep", {
                  required: "Obrigatório",
                  pattern: { value: /^\d{5}-?\d{3}$/, message: "CEP inválido" },
                  onBlur: (e) => buscarCep(e.target.value),
                })}
                error={errors["endereco.cep"]?.message}
              />
              <Input
                label="Número"
                {...register("endereco.numero", { required: "Obrigatório" })}
                error={errors["endereco.numero"]?.message}
              />
            </div>
            <Input
              label="Logradouro"
              {...register("endereco.logradouro")}
              readOnly
              className="bg-gray-100"
            />
            <Input
              label="Cidade"
              {...register("endereco.cidade")}
              readOnly
              className="bg-gray-100"
            />
            <Input
              label="Estado"
              {...register("endereco.estado")}
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