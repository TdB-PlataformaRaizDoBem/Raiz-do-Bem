import React from 'react';
import { useFormContext } from 'react-hook-form';
import { type DentistFormData } from './VoluntaryFormData';
import { useCep } from '../../../hooks/useCep';
import Input from '../../../components/form/Input';

const VoluntaryFormFields = () => {
  const { register, formState: { errors } } = useFormContext<DentistFormData>();
  const { buscarCep } = useCep<DentistFormData>();

  return (
    <div className="w-full max-w-[1060px]">
      {/* INFORMAÇÕES PESSOAIS */}
      <h2 className=" text-2xl font-bold mt-[100px] mb-8 border-b border-white/10 pb-2">INFORMAÇÕES PESSOAIS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input label="Nome Completo:" placeholder="Digite seu nome completo" {...register("nome", { required: "Obrigatório" })} error={errors.nome?.message} />
        <Input label="CPF: (Apenas os números)" placeholder="000.000.000-00" {...register("cpf", { required: "Obrigatório" })} error={errors.cpf?.message} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input label="Email:" type="email" placeholder="Digite seu email" {...register("email", { required: "Obrigatório" })} error={errors.email?.message} />
        <Input label="Celular:" placeholder="(11) 91111-1111" {...register("celular", { required: "Obrigatório" })} error={errors.celular?.message} />
      </div>

      <h2 className=" text-2xl font-bold mt-[60px] mb-8 border-b border-white/10 pb-2">LOCALIZAÇÃO DA CLÍNICA</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input label="CEP:" placeholder="00000-000" {...register("cep", { required: "Obrigatório", onBlur: (e) => buscarCep(e.target.value) })} error={errors.cep?.message} />
        <Input label="Cidade:" readOnly {...register("cidade")} className="bg-[#d9d9d9]/70 cursor-not-allowed" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input label="Estado:" readOnly {...register("estado")} className="bg-[#d9d9d9]/70 cursor-not-allowed" />
        <div className="flex flex-col">
           <label className="text-[1.125rem] font-semibold mb-2 ">País:</label>
           <select {...register("pais", { required: "Obrigatório" })} className="w-full md:w-[500px] h-[40px] rounded-[8px] bg-[#d9d9d9] px-[14px] text-black outline-none">
              <option value="Brasil">Brasil</option>
              <option value="Portugal">Portugal</option>
           </select>
        </div>
      </div>

      <h2 className=" text-2xl font-bold mt-[60px] mb-8 border-b border-white/10 pb-2">INFORMAÇÕES PROFISSIONAIS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input label="CRO:" placeholder="Digite seu registro" {...register("cro", { required: "Obrigatório" })} error={errors.cro?.message} />
        <Input label="Especialidade(s):" placeholder="Ex: Ortodontia" {...register("especialidades", { required: "Obrigatório" })} error={errors.especialidades?.message} />
      </div>

      <h2 className=" text-2xl font-bold mt-[60px] mb-8 border-b border-white/10 pb-2">PREFERÊNCIAS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <div className="flex flex-col">
          <label className="text-[1.125rem] font-semibold mb-2 ">Público Atendido:</label>
          <select {...register("publicoAtendido", { required: "Obrigatório" })} className="w-full md:w-[500px] h-[40px] rounded-[8px] bg-[#d9d9d9] px-[14px] text-black outline-none">
            <option value="criancas">Crianças e Adolescentes</option>
            <option value="mulheres">Mulheres</option>
            <option value="ambos">Ambos</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] my-[30px]">
        <Input label="Qtd. Crianças:" type="number" {...register("qtdCriancas", { valueAsNumber: true })} />
        <Input label="Qtd. Mulheres:" type="number" {...register("qtdMulheres", { valueAsNumber: true })} />
      </div>
    </div>
  );
};

export default VoluntaryFormFields;