import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import { validateAge } from "./validateAge";

export interface ContactFormData {
  nome: string;
  cpf: string;
  nascimento: string;
  sexo: "masculino" | "feminino";
  violenciaDomestica?: "sim" | "nao";
  celular: string;
  email: string;
  cep: string;
  cidade: string;
  estado: string;
  acompanhamento: "sim" | "nao";
  problemas: string;
  tempoSintomas: string;
  mensagem?: string;
}

const ContactForm = () => {
  const [step, setStep] = React.useState(1);
  const methods = useForm<ContactFormData>({ mode: "onBlur" });
  const nascimento = methods.watch("nascimento");
  const sexo = methods.watch("sexo");
  const violencia = methods.watch("violenciaDomestica");

  const idade = nascimento ? validateAge(nascimento) : 0;

  const isHomemAdulto = sexo === "masculino" && idade >= 18;
  const isMulherInativa =
    sexo === "feminino" && idade >= 18 && violencia === "nao";

  const mensagemErro = isHomemAdulto
    ? "O atendimento para homens é restrito a menores de 18 anos."
    : isMulherInativa
      ? "Para mulheres acima de 18 anos, o projeto é exclusivo para vítimas de violência."
      : null;

  const onSubmit = (data: ContactFormData) => {
    console.log("Dados Finais:", data);
    alert("Enviado com sucesso!");
  };

  const handleNextStep = async () => {
    const fieldsToValidate: (keyof ContactFormData)[] = [
      "nome",
      "cpf",
      "nascimento",
      "sexo",
      "celular",
      "email",
      "cep",
      "cidade",
      "estado",
    ];

    const isStepOneValid = await methods.trigger(fieldsToValidate);

    if (isStepOneValid) {
      setStep(2);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="bg-darkgreen p-8 rounded-xl shadow-2xl max-w-[860px] mx-auto"
      >
        {step === 1 ? <StepOne /> : <StepTwo />}

        {mensagemErro && (
          <div className="text-center p-4 bg-red-400 text-white font-bold rounded-md mb-4">
            {mensagemErro}
          </div>
        )}

        <div className="flex gap-4 justify-center mt-8">
          {step === 2 && (
            <Button
              type="button"
              onClick={() => setStep(1)}
              className="bg-transparent border border-white"
            >
              Voltar
            </Button>
          )}

          {step === 1 ? (
            <Button
              type="button"
              disabled={!!mensagemErro}
              onClick={handleNextStep}
              className={`bg-orange ${
                mensagemErro
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-amber"
              }`}
            >
              Próxima Etapa
            </Button>
          ) : (
            <Button type="submit" className="bg-orange">
              Enviar para Triagem
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default ContactForm;
