import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button";
import { validateAge } from "../../../hooks/validateAge";
import Input from "../../../components/formElements/Input";
import TextArea from "../../../components/formElements/TextArea";
import { ToastNotificationContext } from "../../../components/context/NotificationContext";
import { criarPedidoAjuda } from "../../../services/PedidoService";
import type { SexoAPI } from "../../../domain/types/api-schema";

export interface ContactFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  dataNascimento: string;
  sexo: "masculino" | "feminino" | "outros" | "";
  violenciaDomestica?: "sim" | "nao" | "";
  descricaoProblema: string;

  endereco: {
    cep: string;
    numero: string;
  };
}

// Mapeia sexo do formulário para o enum da API
const SEXO_API_MAP: Record<string, SexoAPI> = {
  masculino: "M",
  feminino: "F",
  outros: "O",
};

const ContactForm = () => {
  const methods = useForm<ContactFormData>({
    mode: "onBlur",
    defaultValues: { sexo: "", violenciaDomestica: "" },
  });

  const {
    register,
    watch,
    formState: { errors, isSubmitting },
  } = methods;

  const dataNascimento = watch("dataNascimento");
  const sexo = watch("sexo");
  const violencia = watch("violenciaDomestica");
  const idade = dataNascimento ? validateAge(dataNascimento) : 0;

  const isHomemAdulto = sexo === "masculino" && idade >= 18;
  const isMulherInativa =
    sexo === "feminino" && idade >= 18 && violencia === "nao";

  const mensagemErro = isHomemAdulto
    ? "O atendimento para homens é restrito a menores de 18 anos."
    : isMulherInativa
      ? "Para mulheres cis/trans acima de 18 anos, o projeto é exclusivo para vítimas de violência."
      : null;

  const { showNotification } = React.useContext(ToastNotificationContext)!;

  const onSubmit = async (data: ContactFormData) => {
    try {
      await criarPedidoAjuda({
        nome: data.nome,
        cpf: data.cpf.replace(/\D/g, ""),
        dataNascimento: data.dataNascimento,
        sexo: SEXO_API_MAP[data.sexo] ?? "O",
        telefone: data.telefone.replace(/\D/g, ""),
        email: data.email,
        descricaoProblema: data.descricaoProblema,
        endereco: {
          cep: data.endereco.cep.replace(/\D/g, ""),
          numero: data.endereco.numero,
        },
      });

      showNotification("Pedido enviado com sucesso!", "success");
      methods.reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar pedido";
      showNotification(msg, "error");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="bg-darkgreen p-8 rounded-xl shadow-2xl w-full md:w-[650px] mx-auto flex flex-col gap-5"
      >
        <div className="text-center mb-2">
          <h2 className="text-white text-3xl font-bold font-fredoka">
            Solicitar Ajuda
          </h2>
          <p className="text-white/60 text-xs mt-1 italic uppercase tracking-widest">
            Preencha com os dados de quem necessita de um dentista
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Input
            label="Nome Completo: *"
            labelClassName="text-white"
            errorClassName="text-white"
            {...register("nome", {
              required: "Nome é obrigatório",
              minLength: {
                value: 3,
                message: "Nome deve ter no mínimo 3 caracteres",
              },
              pattern: {
                value: /^[A-Za-zÀ-ÿ\s]+$/,
                message: "Nome deve conter apenas letras",
              },
            })}
            error={errors.nome?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CPF: *"
              labelClassName="text-white"
              errorClassName="text-white"
              placeholder="000.000.000-00"
              {...register("cpf", {
                required: "CPF é obrigatório",
                pattern: {
                  value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/,
                  message: "CPF inválido (use 000.000.000-00)",
                },
              })}
              error={errors.cpf?.message}
            />

            <Input
              label="Data de Nascimento: *"
              labelClassName="text-white"
              errorClassName="text-white"
              type="date"
              {...register("dataNascimento", {
                required: "Data de nascimento é obrigatória",
              })}
              error={errors.dataNascimento?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-white text-sm font-medium">Sexo: *</label>
              <select
                {...register("sexo", {
                  required: "Selecione o sexo",
                })}
                className="p-3 rounded-md bg-white h-[52px] focus:ring-2 focus:ring-orange outline-none"
              >
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outros">Outros</option>
              </select>
              {errors.sexo && (
                <p className="text-white text-xs">{errors.sexo.message}</p>
              )}
            </div>

            {sexo !== "feminino" && <div className="hidden md:block" />}

            {sexo === "feminino" && idade >= 18 && (
              <div className="col-span-full flex flex-col gap-3 animate-fadeIn bg-white/10 p-4 rounded-lg border border-white/20 mt-2">
                <label className="text-white text-sm font-medium leading-relaxed">
                  Nossos programas para mulheres adultas (cis e trans) são
                  focados em casos de vulnerabilidade por violência. Você se
                  enquadra neste perfil? *
                </label>

                <select
                  {...register("violenciaDomestica", {
                    required: "Selecione uma opção",
                  })}
                  className="p-3 rounded-md bg-white h-[52px] text-black font-medium"
                >
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>

                {errors.violenciaDomestica && (
                  <p className="text-white text-xs">
                    {errors.violenciaDomestica.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email: *"
              labelClassName="text-white"
              errorClassName="text-white"
              type="email"
              {...register("email", {
                required: "Email é obrigatório",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email inválido",
                },
              })}
              error={errors.email?.message}
            />

            <Input
              label="Telefone: *"
              labelClassName="text-white"
              errorClassName="text-white"
              placeholder="(11) 99999-9999"
              {...register("telefone", {
                required: "Telefone é obrigatório",
                pattern: {
                  value: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
                  message: "Telefone inválido",
                },
              })}
              error={errors.telefone?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="CEP: *"
              labelClassName="text-white"
              {...register("endereco.cep", {
                required: "CEP é obrigatório",
                pattern: {
                  value: /^\d{5}-?\d{3}$/,
                  message: "CEP inválido",
                },
              })}
              error={errors.endereco?.cep?.message}
            />

            <Input
              label="Número: *"
              labelClassName="text-white"
              {...register("endereco.numero", {
                required: "Número é obrigatório",
              })}
              error={errors.endereco?.numero?.message}
            />
          </div>

          <TextArea
            label="Descrição do Problema: *"
            labelClassName="text-white"
            errorClassName="text-white"
            placeholder="Conte-nos o que está sentindo..."
            rows={4}
            {...register("descricaoProblema", {
              required: "Descrição é obrigatória",
              minLength: {
                value: 20,
                message: "Mínimo de 20 caracteres",
              },
            })}
            error={errors.descricaoProblema?.message}
          />
        </div>

        {mensagemErro && (
          <div className="mt-4 p-5 bg-white/5 border border-white/20 rounded-xl animate-fadeIn">
            <h3 className="text-orange font-bold text-sm mb-2 uppercase tracking-wider">
              Canais de Apoio Recomendados
            </h3>
            <p className="text-white text-sm leading-relaxed mb-4">
              Seu perfil não se enquadra nos projetos atuais da Turma do Bem,
              mas você pode encontrar atendimento gratuito nestes locais:
            </p>

            <div className="grid grid-cols-1 gap-3 text-left">
              <div className="bg-white/10 p-3 rounded-lg border-l-4 border-orange">
                <span className="text-white font-bold text-xs">
                  REDE PÚBLICA (SUS)
                </span>
                <p className="text-white/70 text-sm mt-1">
                  Procure a <strong>Unidade Básica de Saúde (UBS)</strong> mais
                  próxima de você. Solicite informações sobre o programa{" "}
                  <strong>Brasil Sorridente</strong> para triagem odontológica
                  gratuita.
                </p>
              </div>

              <div className="bg-white/10 p-3 rounded-lg border-l-4 border-lightgreen">
                <span className="text-white font-bold text-xs">
                  FACULDADES DE ODONTOLOGIA
                </span>
                <p className="text-white/70 text-sm mt-1">
                  Busque por <strong>"Clínica de Odontologia"</strong> em
                  universidades federais ou estaduais da sua região.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://www.google.com/search?q=faculdade+de+odontologia+atendimento+gratuito+proximo+a+mim",
                  "_blank",
                )
              }
              className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded transition-all border border-white/10"
            >
              Buscar Faculdades Próximas de Mim
            </button>
          </div>
        )}

        <Button
          type="submit"
          disabled={!!mensagemErro || isSubmitting}
          className={`bg-orange mt-2 ${
            mensagemErro || isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-amber"
          }`}
        >
          {isSubmitting ? "Enviando..." : "Enviar para Triagem"}
        </Button>
      </form>
    </FormProvider>
  );
};

export default ContactForm;
