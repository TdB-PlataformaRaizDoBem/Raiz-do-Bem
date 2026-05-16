import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import VoluntaryFormFields, { type VoluntaryFormValues } from './VoluntaryFormFields';
import { Button } from '../../../components/ui/Button';
import { ToastNotificationContext } from '../../../components/context/NotificationContext';
import { criarDentista } from '../../../services/DentistaService';
import type { SexoAPI } from '../../../domain/types/api-schema';

// Mapeamento do valor do select ("1", "2", "3") → enum da API ("M", "F", "O")
const SEXO_ID_MAP: Record<string, SexoAPI> = {
  "1": "M",
  "2": "F",
  "3": "O",
};

const VoluntaryForm = () => {
  const methods = useForm<VoluntaryFormValues>({ mode: "onBlur" });
  const { showNotification } = React.useContext(ToastNotificationContext)!;

  const onSubmit = async (data: VoluntaryFormValues) => {
    try {
      await criarDentista({
        croDentista: data.cro,
        cpf: data.cpf,
        nomeCompleto: data.nomeCompleto,
        sexo: SEXO_ID_MAP[data.idSexo] ?? "O",
        email: data.email,
        telefone: data.telefone,
        categoria: data.especialidades,
        disponivel: "S",
        endereco: {
          cep: data.cep,
          numero: data.numero,
          tipoEndereco: "PROFISSIONAL",
        },
      });

      showNotification("Cadastro de voluntário realizado com sucesso!", "success");
      methods.reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar voluntário";
      showNotification(msg, "error");
    }
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
