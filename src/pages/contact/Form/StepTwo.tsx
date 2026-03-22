import { useFormContext } from "react-hook-form";
import Input from "../../../components/formElements/Input";
import TextArea from "../../../components/formElements/TextArea";
import { type ContactFormData } from "./ContactForm";

const StepTwo = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ContactFormData>();

  return (
    <div className="animate-fadeIn flex flex-col gap-6">
      <h2 className="text-white text-xl font-bold mb-2 font-fredoka border-b border-white/20 pb-2">
        Triagem Clínica
      </h2>

      <div className="flex flex-col">
        <label className="block mb-1 font-medium text-white font-sans">
          Já possui acompanhamento odontológico? *
        </label>
        <select
          {...register("acompanhamento", { required: "Obrigatório" })}
          className="w-full p-3 rounded-md bg-white text-black focus:outline-none"
        >
          <option value="">Selecione</option>
          <option value="sim">Sim</option>
          <option value="nao">Não</option>
        </select>
        {errors.acompanhamento && (
          <p className="text-orange text-xs mt-1">
            {errors.acompanhamento.message}
          </p>
        )}
      </div>

      <Input
        label="Principais problemas percebidos: *"
        labelClassName="text-white"
        placeholder="Ex: Dor, dentes ausentes, sangramento..."
        {...register("problemas", {
          required: "Descreva brevemente o que sente.",
        })}
        error={errors.problemas?.message}
      />

      <TextArea
        label="Conte um pouco sobre sua situação (Opcional)"
        labelClassName="text-white"
        placeholder="Espaço para detalhes adicionais que queira compartilhar..."
        rows={4}
        {...register("mensagem")}
      />
    </div>
  );
};

export default StepTwo;
