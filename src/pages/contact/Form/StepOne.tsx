import React from "react";
import Input from "../../../components/form/Input";
import { type ContactFormData } from "./ContactForm";
import { useFormContext } from "react-hook-form";
import { useCep } from "../../../hooks/useCep";

const StepOne = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<ContactFormData>();
  const sexo = watch("sexo");
  const { buscarCep } = useCep(); 

  return (
    <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-4">
      <h2 className="col-span-full text-white text-4xl font-bold mb-4 text-center">
        Dados Pessoais
      </h2>
      <div className="col-span-full">
        <Input
          label="Nome Completo: *"
          labelClassName="text-white"
          {...register("nome", { required: "O nome é obrigatório." })}
          error={errors.nome?.message}
        />
      </div>
      <Input
        label="CPF: *"
        labelClassName="text-white"
        placeholder="000.000.000-00"
        {...register("cpf", {
          required: "CPF é obrigatório.",
          pattern: {
            value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
            message: "Formato inválido. Use 000.000.000-00",
          },
        })}
        error={errors.cpf?.message}
      />
      <Input
        label="Data de Nascimento: *"
        labelClassName="text-white"
        type="date"
        {...register("nascimento", {
          required: "A data de nascimento é obrigatório.",
        })}
        error={errors.nascimento?.message}
      />

      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="block mb-1 font-medium text-white font-sans">
            Sexo: *
          </label>
          <select
            {...register("sexo", { required: "Obrigatório" })}
            className="w-full p-3 rounded-md bg-white text-black focus:outline-none h-[52px]"
          >
            <option value="">Selecione</option>
            <option value="masculino">Masculino</option>
            <option value="feminino">Feminino</option>
          </select>
        </div>

        {sexo === "feminino" && (
          <div className="flex flex-col animate-fadeIn">
            <label className="block mb-1 font-medium text-white font-sans">
              Vítima de violência?
            </label>
            <select
              {...register("violenciaDomestica", { required: "Obrigatório" })}
              className="w-full p-3 rounded-md bg-white text-black focus:outline-none h-[52px]"
            >
              <option value="">Selecione</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>
        )}
      </div>

      <div className="col-span-full">
        <Input
          label="Email: *"
          labelClassName="text-white"
          type="email"
          {...register("email", {
            required: "O email é obrigatório.",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "O email deve conter o @",
            },
          })}
          error={errors.email?.message}
        />
      </div>

      <Input
        label="Celular: *"
        labelClassName="text-white"
        placeholder="+55 (11) 00000-0000"
        {...register("celular", {
          required: "O número do celular é obrigatório",
          pattern: {
            value:
              /^\+([1-9]{1,3})?[\s.-]?\(?[1-9]{2}\)?[\s.-]?9?[0-9]{4}[\s.-]?[0-9]{4}$/,
            message:
              "O número de celular deve conter o DDI, DDD, Prefixo e Sufixo",
          },
        })}
        error={errors.celular?.message}
      />

      <Input
        label="CEP: *"
        labelClassName="text-white"
        placeholder="000000-000"
        {...register("cep", {
          required: "O CEP é obrigatório",
          pattern: {
            value: /^[0-9]{5}-?[0-9]{3}$/,
            message: "O CEP deve conter apenas caracteres númericos",
          },
          onBlur: (e) => buscarCep(e.target.value)
        })}
        error={errors.cep?.message}
      />

      <Input
        label="Estado: *"
        labelClassName="text-white"
        {...register("estado", {
          required: "O estado é obrigatório",
        })}
        error={errors.estado?.message}
      />

      <Input
        label="Cidade: *"
        labelClassName="text-white"
        {...register("cidade", {
          required: "A cidade é obrigatório",
        })}
        error={errors.cidade?.message}
      />
    </div>
  );
};

export default StepOne;