import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "../../../components/ui/Button";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";

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
      "estado"
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
              onClick={handleNextStep}
              className="bg-orange"
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
