import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import VoluntaryFormFields, {
  type VoluntaryFormValues,
} from "./VoluntaryFormFields";
import { Button } from "../../../components/ui/Button";
import { ToastNotificationContext } from "../../../components/context/NotificationContext";
import { registrarDentistaVoluntario } from "../../../services/DentistaService";
import { loadFormDraft, useFormDraft } from "../../../hooks/useFormDraft";

const DRAFT_KEY = "raiz-do-bem:voluntary-form";
const FORM_DEFAULTS: VoluntaryFormValues = {
  nomeCompleto: "",
  croDentista: "",
  cpf: "",
  email: "",
  telefone: "",
  sexo: "F",
  categoria: "CLINICO",
  disponivel: "S",
  idEspecialidade: 0,
  endereco: { cep: "", numero: "" },
};

const VoluntaryForm = () => {
  const draft = loadFormDraft<VoluntaryFormValues>(DRAFT_KEY);

  const methods = useForm<VoluntaryFormValues>({
    mode: "onBlur",
    defaultValues: { ...FORM_DEFAULTS, ...(draft ?? {}) },
  });

  const { showNotification } = React.useContext(ToastNotificationContext)!;
  const { clearDraft } = useFormDraft(
    DRAFT_KEY,
    methods.watch,
    methods.formState.isDirty,
  );;

  const onSubmit = async (data: VoluntaryFormValues) => {
    try {
      await registrarDentistaVoluntario({
        croDentista: data.croDentista,
        cpf: data.cpf.replace(/\D/g, ""),
        nomeCompleto: data.nomeCompleto,
        sexo: data.sexo,
        email: data.email,
        telefone: data.telefone.replace(/\D/g, ""),
        categoria: "CLINICO",
        disponivel: "S",
        idEspecialidade: data.idEspecialidade,
        endereco: {
          cep: data.endereco.cep.replace(/\D/g, ""),
          numero: data.endereco.numero,
        },
      });

      showNotification(
        "Cadastro de voluntário realizado com sucesso!",
        "success",
      );
      clearDraft();
      methods.reset(FORM_DEFAULTS);
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
