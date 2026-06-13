import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form";
import type { DentistaViewModel } from "../../../domain/mappers/DentistaMapper";
import { atualizarDentista } from "../../../services/DentistaService";
import { formatCPF } from "../../../utils/formatUtils";
import { useNotification } from "../../../hooks/useNotification";
import { useCep } from "../../../hooks/useCep";
import { useEspecialidades } from "../../../hooks/useEspecialidades";
import Input from "../../formElements/Input";
import { Button } from "../../ui/Button";
import { SelectEspecialidade } from "../../formElements/SelectEspecialidade";

type UpdateDentistaProps = {
  initialData: DentistaViewModel;
  onSuccess: () => void;
};

type DentistaEditavel = {
  email: string;
  telefone: string;
  categoriaDentista: string;
  disponivel: "S" | "N";
  idEspecialidade: number;
  endereco: {
    cep: string;
    numero: string;
    rua: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
};

// Sentinela: precisa estar dentro de FormProvider para acessar o contexto
const CepWatcher = () => {
  const { watch } = useFormContext<DentistaEditavel>();
  useCep<DentistaEditavel>(watch("endereco.cep"), "endereco");
  return null;
};

const UpdateDentista = ({ initialData, onSuccess }: UpdateDentistaProps) => {
  const { showNotification } = useNotification();

  const {
    data: especialidades,
    loading: loadingEspecialidades,
    error: errorEspecialidades,
  } = useEspecialidades();

  const resolverIdInicial = (): number => {
    const nomeAtual = initialData.especialidades?.[0];
    if (!nomeAtual || !especialidades) return 0;
    const encontrada = especialidades.find(
      (e) => e.descricao.toLowerCase() === nomeAtual.toLowerCase()
    );
    return encontrada?.id ?? 0;
  };

  const methods = useForm<DentistaEditavel>({
    defaultValues: {
      email: initialData.email === "—" ? "" : initialData.email,
      telefone: initialData.telefone === "—" ? "" : initialData.telefone,
      categoriaDentista: initialData.categoria === "—" ? "" : initialData.categoria,
      disponivel: initialData.disponivel ? "S" : "N",
      idEspecialidade: resolverIdInicial(),
      endereco: {
        cep: initialData.cep ?? "",
        numero: initialData.numero ?? "",
        rua: initialData.logradouro ?? "",
        bairro: "",
        cidade: initialData.cidade ?? "",
        uf: initialData.estado ?? "",
      },
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
  } = methods;

  const onSubmit = async (data: DentistaEditavel) => {
    if (!isDirty) return;
    try {
      await atualizarDentista(initialData.cpf, {
        email: data.email,
        telefone: data.telefone.replace(/\D/g, ""),
        categoriaDentista: data.categoriaDentista,
        disponivel: data.disponivel,
        idEspecialidade: data.idEspecialidade,
        endereco: {
          cep: data.endereco.cep.replace(/\D/g, ""),
          numero: data.endereco.numero,
        },
      });

      showNotification(
        `Dentista ${initialData.nomeCompleto} atualizado!`,
        "success"
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
        className="flex flex-col max-w-3xl w-full text-left bg-white rounded-2xl p-1"
      >
        <h2 className="text-2xl font-bold font-fredoka mb-6 text-darkgray px-1">
          Editar Dentista
        </h2>

        <div className="flex-1 max-h-[58vh] overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-5">

          {/* DADOS IMUTÁVEIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <Input
              label="Nome Completo"
              defaultValue={initialData.nomeCompleto}
              readOnly
              className="bg-gray-200 cursor-not-allowed text-gray-500"
            />
            <Input
              label="CPF"
              defaultValue={formatCPF(initialData.cpf)}
              readOnly
              className="bg-gray-200 cursor-not-allowed text-gray-500"
            />
            <Input
              label="CRO"
              defaultValue={initialData.croDentista}
              readOnly
              className="bg-gray-200 cursor-not-allowed text-gray-500"
            />
            <Input
              label="Sexo"
              defaultValue={initialData.sexoLabel}
              readOnly
              className="bg-gray-200 cursor-not-allowed text-gray-500"
            />
          </div>

          {/* DADOS EDITÁVEIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email"
              {...register("email", {
                required: "Obrigatório",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email inválido",
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Telefone"
              {...register("telefone", { required: "Obrigatório" })}
              error={errors.telefone?.message}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-darkgray mb-1">
                Disponibilidade
              </label>
              <select
                {...register("disponivel")}
                className="p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary text-sm h-[50px]"
              >
                <option value="S">Sim</option>
                <option value="N">Não</option>
              </select>
            </div>

            <Input
              label="Categoria"
              {...register("categoriaDentista", { required: "Obrigatório" })}
              error={errors.categoriaDentista?.message}
            />

            <Controller
              name="idEspecialidade"
              control={control}
              rules={{
                required: "Obrigatório",
                validate: (val) =>
                  (val !== undefined && val > 0) || "Selecione uma especialidade",
              }}
              render={({ field, fieldState }) => {
                const valorResolvido =
                  field.value && field.value > 0
                    ? field.value
                    : (() => {
                        const nomeAtual = initialData.especialidades?.[0];
                        if (!nomeAtual || !especialidades) return field.value;
                        const encontrada = especialidades.find(
                          (e) => e.descricao.toLowerCase() === nomeAtual.toLowerCase()
                        );
                        if (encontrada && encontrada.id !== field.value) {
                          field.onChange(encontrada.id);
                        }
                        return encontrada?.id ?? field.value;
                      })();

                return (
                  <SelectEspecialidade
                    value={valorResolvido || ""}
                    onChange={(id) => field.onChange(id)}
                    onBlur={field.onBlur}
                    especialidades={especialidades ?? []}
                    loading={loadingEspecialidades}
                    error={fieldState.error?.message}
                    fetchError={errorEspecialidades}
                    required
                    label="Especialidade"
                    name="idEspecialidade"
                  />
                );
              }}
            />
          </div>

          {/* ENDEREÇO */}
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="font-bold text-darkgray mb-4 font-fredoka text-lg">
              Endereço do Consultório
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CEP"
                  {...register("endereco.cep", {
                    required: "Obrigatório",
                    pattern: {
                      value: /^\d{5}-?\d{3}$/,
                      message: "CEP inválido",
                    },
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
                className="bg-gray-100 cursor-not-allowed text-gray-500"
              />
              <Input
                label="Cidade"
                {...register("endereco.cidade")}
                readOnly
                className="bg-gray-100 cursor-not-allowed text-gray-500"
              />
              <Input
                label="Estado"
                {...register("endereco.uf")}
                readOnly
                className="bg-gray-100 cursor-not-allowed text-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100 px-1">
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
            {isSubmitting ? "Salvando..." : isDirty ? "Salvar Alterações" : "Sem mudanças"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateDentista;