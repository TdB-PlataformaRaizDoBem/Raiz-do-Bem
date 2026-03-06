import React from "react";
import { useFormContext } from "react-hook-form";
import { type DentistFormData } from "./VoluntaryFormData";
import { useCep } from "../../../hooks/useCep";
import Input from "../../../components/form/Input";

const VoluntaryFormFields = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<DentistFormData>();
  const { buscarCep } = useCep<DentistFormData>();

  return (
    <div className="w-full max-w-[1060px]">
      <h2 className="text-2xl font-bold mt-[100px] mb-8 border-b border-white/10 pb-2">
        INFORMAÇÕES PESSOAIS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input
          label="Nome Completo:"
          placeholder="Digite seu nome completo"
          {...register("nome", {
            required: "Por favor, digite seu nome completo",
            minLength: {
              value: 3,
              message: "O nome deve ter pelo menos 3 caracteres",
            },
          })}
          error={errors.nome?.message}
        />

        <Input
          label="CPF: (Apenas os números)"
          placeholder="000.000.000-00"
          {...register("cpf", {
            required: "O CPF é obrigatório para o cadastro",
            pattern: {
              value: /^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
              message: "Formato de CPF inválido",
            },
          })}
          error={errors.cpf?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input
          label="Email:"
          type="email"
          placeholder="Digite seu email"
          {...register("email", {
            required: "E-mail é essencial para o contato",
            pattern: {
              value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
              message: "Digite um e-mail válido",
            },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Celular:"
          placeholder="(11) 91111-1111"
          {...register("celular", {
            required: "Número de celular é obrigatório",
            minLength: { value: 10, message: "Número incompleto" },
          })}
          error={errors.celular?.message}
        />
      </div>

      <h2 className="text-2xl font-bold mt-[60px] mb-8 border-b border-white/10 pb-2">
        LOCALIZAÇÃO DA CLÍNICA
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input
          label="CEP:"
          placeholder="00000-000"
          {...register("cep", {
            required: "CEP é necessário para localizar sua clínica",
            onBlur: (e) => buscarCep(e.target.value),
            pattern: {
              value: /^\d{5}-?\d{3}$/,
              message: "CEP inválido",
            },
          })}
          error={errors.cep?.message}
        />
        <Input
          label="Cidade:"
          readOnly
          {...register("cidade")}
          className="bg-[#d9d9d9]/70 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input
          label="Estado:"
          readOnly
          {...register("estado")}
          className="bg-[#d9d9d9]/70 cursor-not-allowed"
        />
        <div className="flex flex-col">
          <label className="text-[1.125rem] font-semibold mb-2 ">País:</label>
          <select
            {...register("pais", { required: "Selecione o país" })}
            className="w-full md:w-[500px] h-[40px] rounded-[8px] bg-[#d9d9d9] px-[14px] text-black outline-none border-2 border-transparent focus:border-orange"
          >
            <option value="Brasil">Brasil</option>
            <option value="Portugal">Portugal</option>
          </select>
          {errors.pais && (
            <span className="text-red-500 text-sm mt-1">
              {errors.pais.message}
            </span>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-[60px] mb-8 border-b border-white/10 pb-2">
        INFORMAÇÕES PROFISSIONAIS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input
          label="CRO:"
          placeholder="Ex: 12345-SP"
          {...register("cro", {
            required: "O registro profissional (CRO) é obrigatório",
            pattern: {
              value: /^\d{2,6}-[A-Z]{2}$/i,
              message: "Formato aceito: Números-UF (ex: 12345-SP)",
            },
          })}
          error={errors.cro?.message}
        />
        <Input
          label="Especialidade(s):"
          placeholder="Ex: Ortodontia"
          {...register("especialidades", {
            required: "Informe ao menos uma especialidade",
          })}
          error={errors.especialidades?.message}
        />
      </div>

      <h2 className="text-2xl font-bold mt-[60px] mb-8 border-b border-white/10 pb-2">
        PREFERÊNCIAS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <div className="flex flex-col">
          <label className="text-[1.125rem] font-semibold mb-2 ">
            Público Atendido:
          </label>
          <select
            {...register("publicoAtendido", {
              required: "Selecione o público",
            })}
            className="w-full md:w-[500px] h-[40px] rounded-[8px] bg-[#d9d9d9] px-[14px] text-black outline-none border-2 border-transparent focus:border-orange"
          >
            <option value="criancas">Crianças e Adolescentes</option>
            <option value="mulheres">Mulheres</option>
            <option value="ambos">Ambos</option>
          </select>
          {errors.publicoAtendido && (
            <span className="text-red-500 text-sm mt-1">
              {errors.publicoAtendido.message}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input
          label="Qtd. Crianças:"
          type="number"
          {...register("qtdCriancas", {
            valueAsNumber: true,
            min: { value: 0, message: "Valor não pode ser negativo" },
          })}
          error={errors.qtdCriancas?.message}
        />
        <Input
          label="Qtd. Mulheres:"
          type="number"
          {...register("qtdMulheres", {
            valueAsNumber: true,
            min: { value: 0, message: "Valor não pode ser negativo" },
          })}
          error={errors.qtdMulheres?.message}
        />
      </div>
    </div>
  );
};

export default VoluntaryFormFields;
