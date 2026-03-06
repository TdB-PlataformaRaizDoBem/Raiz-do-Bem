import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { type DentistFormData } from './VoluntaryFormData';
import VoluntaryFormFields from './VoluntaryFormFields';
import { Button } from '../../../components/ui/Button';

const VoluntaryForm = () => {
  const methods = useForm<DentistFormData>({ mode: "onBlur" });

  const onSubmit = (data: DentistFormData) => {
    console.log('Dados do Dentista:', data);
  };

  return (
    <FormProvider {...methods}>
      <section className="flex flex-col items-center my-[100px] w-full px-4">
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          
          <VoluntaryFormFields />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[60px] mt-[60px] w-full max-w-[1060px]">
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