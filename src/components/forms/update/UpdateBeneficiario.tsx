import { useForm, FormProvider, useFormContext } from "react-hook-form";
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
  endereco: {
    cep: string;
    numero: string;
    rua: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
};

// Componente sentinela: precisa estar dentro de FormProvider para acessar o contexto
const CepWatcher = () => {
  const { watch } = useFormContext<BeneficiarioEditavel>();
  useCep<BeneficiarioEditavel>(watch("endereco.cep"), "endereco");
  return null;
};

const UpdateBeneficiario = ({
  initialData,
  onSuccess,
}: UpdateBeneficiarioProps) => {
  const { showNotification } = useNotification();

  const methods = useForm<BeneficiarioEditavel>({
    defaultValues: {
      nomeCompleto: initialData.nomeCompleto,
      email: initialData.email,
      telefone: initialData.telefone,
      programaSocial: initialData.programaSocial ?? "",
      endereco: {
        cep: initialData.endereco?.cep ?? "",
        numero: initialData.endereco?.numero ?? "",
        rua: initialData.endereco?.logradouro ?? "",
        bairro: "",
        cidade: initialData.endereco?.cidade ?? "",
        uf: initialData.endereco?.estado ?? "",
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isDirty, errors, isSubmitting },
  } = methods;

  const onSubmit = async (data: BeneficiarioEditavel) => {
    if (!isDirty) return;
    try {
      await atualizarBeneficiario(initialData.cpf, {
        email: data.email,
        telefone: data.telefone.replace(/\D/g, ""),
        endereco: {
          cep: data.endereco.cep.replace(/\D/g, ""),
          numero: data.endereco.numero,
        },
      });

      showNotification(
        `${data.nomeCompleto} atualizado com sucesso!`,
        "success",
      );
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar";
      showNotification(msg, "error");
    }
  };

  const isButtonDisabled = !isDirty || isSubmitting;

  return (
    <FormProvider {...methods}>
      <CepWatcher />
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
              defaultValue={initialData.cpf}
              readOnly
              className="bg-gray-200 cursor-not-allowed"
            />
            <Input
              label="Data de Nascimento"
              defaultValue={initialData.dataNascimento}
              readOnly
              className="bg-gray-200 cursor-not-allowed"
            />
          </div>

          {/* Dados editáveis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Nome Completo"
              {...register("nomeCompleto")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label="E-mail"
              type="email"
              {...register("email", {
                required: "Obrigatório",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "E-mail inválido",
                },
              })}
              error={errors.email?.message}
            />
            <Input
              label="Telefone"
              {...register("telefone", { required: "Obrigatório" })}
              error={errors.telefone?.message}
            />
            <Input
              label="Programa Social"
              {...register("programaSocial")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold text-darkgray mb-4 font-fredoka">
              Endereço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CEP"
                  {...register("endereco.cep", {
                    required: "Obrigatório",
                    pattern: { value: /^\d{5}-?\d{3}$/, message: "CEP inválido" },
                  })}
                  error={errors.endereco?.cep?.message}
                />
                <Input
                  label="Número"
                  {...register("endereco.numero", { required: "Obrigatório" })}
                  error={errors.endereco?.numero?.message}
                />
              </div>
              <Input
                label="Logradouro"
                {...register("endereco.rua")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              <Input
                label="Cidade"
                {...register("endereco.cidade")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
              <Input
                label="Estado"
                {...register("endereco.uf")}
                readOnly
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
          <Button
            variant="secondary"
            type="button"
            disabled={isSubmitting}
            onClick={onSuccess}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isButtonDisabled}
            className={isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""}
          >
            {isSubmitting
              ? "Salvando..."
              : isDirty
                ? "Salvar Alterações"
                : "Sem mudanças"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateBeneficiario;
