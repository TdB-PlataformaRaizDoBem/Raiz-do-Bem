import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import VoluntaryFormFields, {
  type VoluntaryFormValues,
} from "./VoluntaryFormFields";
import { Button } from "../../../components/ui/Button";
import { ToastNotificationContext } from "../../../components/context/NotificationContext";
import { criarDentista } from "../../../services/DentistaService";
import type { SexoAPI } from "../../../domain/types/api-schema";

const SEXO_MAP: Record<VoluntaryFormValues["sexo"], SexoAPI> = {
  Masculino: "M",
  Feminino: "F",
  Outro: "O",
};

const formatCRO = (value: string) => {
  const cleaned = value.trim().toUpperCase();
  if (cleaned.startsWith("CRO-")) return cleaned;
  return `CRO-${cleaned}`;
};

const VoluntaryForm = () => {
  const methods = useForm<VoluntaryFormValues>({
    mode: "onBlur",
    defaultValues: {
      nomeCompleto: "",
      croDentista: "",
      cpf: "",
      email: "",
      telefone: "",
      sexo: "Feminino",
      endereco: { cep: "", numero: "" },
    },
  });
  const { showNotification } = React.useContext(ToastNotificationContext)!;

  const onSubmit = async (data: VoluntaryFormValues) => {
    try {
      await criarDentista({
        croDentista: formatCRO(data.croDentista),
        cpf: data.cpf.replace(/\D/g, ""),
        nomeCompleto: data.nomeCompleto,
        sexo: SEXO_MAP[data.sexo],
        email: data.email,
        telefone: data.telefone.replace(/\D/g, ""),

        categoria: "DENTISTA",
        disponivel: "S",

        endereco: {
          cep: data.endereco.cep.replace(/\D/g, ""),
          numero: data.endereco.numero,
        },
      });

      showNotification(
        "Cadastro de voluntário realizado com sucesso!",
        "success",
      );
      methods.reset();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erro ao cadastrar voluntário";
      showNotification(msg, "error");
    }
  };

  return (
    <FormProvider {...methods}>
      <section className="flex flex-col items-center my-[100px] w-full px-4">
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          noValidate
          className="w-full max-w-[1400px]"
        >
          <VoluntaryFormFields />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] mt-[60px] w-full">
            <Link
              to="/"
              className="flex items-center justify-center bg-orange h-[40px] rounded-[8px] text-white text-[1.125rem] font-bold transition-all duration-300 hover:scale-[1.01]"
            >
              Voltar Para A Página Inicial
            </Link>

            <Button type="submit" disabled={methods.formState.isSubmitting}>
              {methods.formState.isSubmitting ? "Enviando..." : "Enviar Dados"}
            </Button>
          </div>
        </form>
      </section>
    </FormProvider>
  );
};

export default VoluntaryForm;
