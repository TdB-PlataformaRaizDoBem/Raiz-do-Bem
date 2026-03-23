import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { type DentistFormData } from './VoluntaryFormData';
import VoluntaryFormFields from './VoluntaryFormFields';
import { Button } from '../../../components/ui/Button';
import { ToastNotificationContext } from '../../../components/context/NotificationContext';

const VoluntaryForm = () => {
  const methods = useForm<DentistFormData>({ mode: "onBlur" });
  const {showNotification} = React.useContext(ToastNotificationContext)!;

  const onSubmit = (data: DentistFormData) => {
  const payload = {
    cro: data.cro,
    especialidade: data.especialidades,
    colaborador: {
      nomeCompleto: data.nomeCompleto,
      cpf: data.cpf,
      dataNascimento: data.dataNascimento,
      email: data.email,
      sexo: { id: Number(data.idSexo) } // Objeto idSexo conforme sua descrição
    },
    endereco: {
      logradouro: data.logradouro,
      cep: data.cep,
      numero: data.numero,
      estado: data.estado,
      cidade: data.cidade,
      idTipoEndereco: 2 // Fixo para consultório, conforme regra da ONG
    }
  };

  console.log("Payload Estruturado para o Oracle:", payload);
  showNotification("Cadastro de voluntário realizado!", "success");
  methods.reset();
};

  return (
    <FormProvider {...methods}>
      <section className="flex flex-col items-center my-[100px] w-full px-4">
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate className="w-full max-w-[1400px]">
          
          <VoluntaryFormFields />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] mt-[60px] w-full">
            <Link 
              to="/" 
              className="flex items-center justify-center bg-orange h-[40px] rounded-[8px] text-white text-[1.125rem] font-bold transition-all duration-300 hover:scale-[1.01]"
            >
              Voltar Para A Página Inicial
            </Link>
            
            <Button type="submit">
              Enviar Dados
            </Button>
          </div>
        </form>
      </section>
    </FormProvider>
  );
}

export default VoluntaryForm;