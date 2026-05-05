import { FormProvider, useForm } from "react-hook-form";
import { useNotification } from "../../../hooks/useNotification";
import { CreateDentistaForm } from "./CreateDentistaForms";
import { criarDentista } from "../../../services/DentistaService";
import type { SexoAPI } from "../../../domain/types/api-schema";

interface CreateDentistaProps {
  onSuccess: () => void;
}

export type DentistaFormValues = {
  nomeCompleto: string;  
  croDentista: string;     
  cpf: string;
  email: string;
  telefone: string;
  sexo: "Masculino" | "Feminino" | "Outro";   
  especialidades: string; 
  disponivel: "true" | "false";               
  programa: "Turma do Bem" | "Apolônias do Bem" | "Ambos";
  "endereco.cep": string;
  "endereco.numero": string;
  "endereco.logradouro": string;
  "endereco.cidade": string;
  "endereco.estado": string;
};

const SEXO_MAP: Record<string, SexoAPI> = { Masculino: "M", Feminino: "F", Outro: "O" };

export const CreateDentista = ({ onSuccess }: CreateDentistaProps) => {
  const { showNotification } = useNotification();

  const methods = useForm<DentistaFormValues>({
    mode: "onBlur",
    defaultValues: {
      nomeCompleto: "",
      croDentista: "",
      cpf: "",
      email: "",
      telefone: "",
      sexo: "Feminino",
      especialidades: "",
      programa: "Ambos",
      disponivel: "true",  
      "endereco.cep": "",
      "endereco.numero": "",
      "endereco.logradouro": "",
      "endereco.cidade": "",
      "endereco.estado": "",
    },
  });

  const onSubmit = async (data: DentistaFormValues) => {
    try {
      await criarDentista({
        croDentista: data.croDentista,    
        cpf: data.cpf,
        nomeCompleto: data.nomeCompleto,     
        sexo: SEXO_MAP[data.sexo] ?? "O",       
        email: data.email,
        telefone: data.telefone,
        categoria: data.especialidades,         
        disponivel: data.disponivel === "true",  
        endereco: {
          cep: data["endereco.cep"],
          numero: data["endereco.numero"],
          tipoEndereco: "PROFISSIONAL",       
        },
      });
      showNotification(`Dentista ${data.nomeCompleto} cadastrado com sucesso!`, "success");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao cadastrar dentista";
      showNotification(msg, "error");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
        <CreateDentistaForm onCancel={onSuccess} />
      </form>
    </FormProvider>
  );
};