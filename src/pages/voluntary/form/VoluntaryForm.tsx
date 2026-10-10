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
import ConsentCheckbox from "../../../components/legal/ConsentCheckbox";
import { ConsentSection, LegalLink } from "../../../components/legal/ConsentSection";
import { consentimentoParaEnvio, criarRegistroConsentimento } from "../../../domain/legal/consentimento";
import { CANAL_TITULAR, CONTROLADOR } from "../../../domain/legal/organizacao";

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
  aceiteTermo: false,
};

/** Campos que nunca vão para o rascunho: identificador (CPF) e a autorização. */
const DRAFT_OMIT = ["cpf", "aceiteTermo"] as const;

const VoluntaryForm = () => {
  const draft = loadFormDraft<VoluntaryFormValues>(DRAFT_KEY, DRAFT_OMIT);

  const methods = useForm<VoluntaryFormValues>({
    mode: "onBlur",
    defaultValues: { ...FORM_DEFAULTS, ...(draft ?? {}) },
  });

  const { showNotification } = React.useContext(ToastNotificationContext)!;
  const { clearDraft } = useFormDraft(
    DRAFT_KEY,
    methods.watch,
    methods.formState.isDirty,
    DRAFT_OMIT,
  );

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
        ...consentimentoParaEnvio(criarRegistroConsentimento("voluntario", ["dados-cadastrais"])),
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

          <div className="mt-[60px] px-4">
            <ConsentSection
              resumo={
                <>
                  <p>
                    A <strong>{CONTROLADOR.nome}</strong> (CNPJ {CONTROLADOR.cnpj}) vai usar seus dados cadastrais e
                    profissionais para validar o cadastro, entrar em contato e relacionar você a pessoas atendidas na sua
                    região. O seu nome e o endereço e contato do consultório podem ser informados à pessoa encaminhada.
                    Você pode pedir acesso, correção ou eliminação dos dados e revogar a autorização quando quiser,
                    escrevendo para {CANAL_TITULAR}.
                  </p>
                </>
              }
            >
              <ConsentCheckbox
                {...methods.register("aceiteTermo", {
                  required: "Para enviar, marque a autorização de uso dos dados.",
                })}
                error={methods.formState.errors.aceiteTermo?.message}
              >
                Li e concordo com o{" "}
                <LegalLink to="/consentimento/voluntario">Termo de Consentimento</LegalLink> e a{" "}
                <LegalLink to="/privacidade">Política de Privacidade</LegalLink>, e autorizo a Turma do Bem a usar os
                dados deste formulário para validar meu cadastro, entrar em contato e me relacionar a pessoas atendidas
                na minha região. *
              </ConsentCheckbox>
            </ConsentSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] mt-[60px] w-full">
            <Link
              to="/"
              className="flex items-center justify-center bg-orange-strong h-[40px] rounded-[8px] text-white text-shadow-contrast text-[1.125rem] font-bold transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-darkgreen/50 focus-visible:ring-offset-2"
            >
              Voltar Para A Página Inicial
            </Link>

            <Button
              type="submit"
              disabled={methods.formState.isSubmitting}
              className="!text-white text-shadow-contrast"
            >
              {methods.formState.isSubmitting ? "Enviando..." : "Enviar Dados"}
            </Button>
          </div>
        </form>
      </section>
    </FormProvider>
  );
};

export default VoluntaryForm;
