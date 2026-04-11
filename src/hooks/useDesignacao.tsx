import { useState } from "react";
import { designacaoData } from "../data/designacaoData";
import { type Beneficiario } from "../data/beneficiariosData";
import { type Dentista, dentistasMock } from "../data/dentistasData";
import { useNotification } from "./useNotification";

export const useDesignacao = () => {
  const [pendentes, setPendentes] = useState<Beneficiario[]>(designacaoData);
  const [beneficiarioEmFoco, setBeneficiarioEmFoco] = useState<Beneficiario | null>(null);
  const [dentistaSelecionado, setDentistaSelecionado] = useState<Dentista | null>(null);
  const [acaoPendente, setAcaoPendente] = useState<string | null>(null);

  const { showNotification } = useNotification()

  const solicitarDesignacao = (b: Beneficiario, d: Dentista) => {
    setBeneficiarioEmFoco(b);
    setDentistaSelecionado(d);
    setAcaoPendente("designar");
  };

  const confirmarDesignacao = () => {
    if (!beneficiarioEmFoco) return;
    setPendentes(prev => prev.filter(b => b.id !== beneficiarioEmFoco.id));
    setAcaoPendente(null);
    showNotification("Designação Concluida com Sucesso!")
  };

  return {
    pendentes,
    acaoPendente,
    beneficiarioEmFoco,
    dentistaSelecionado,
    solicitarDesignacao,
    confirmarDesignacao,
    cancelarDesignacao: () => setAcaoPendente(null)
  };
};

export const buscarDentistasProximos = (beneficiario: Beneficiario): Dentista[] => {
  if (!beneficiario) return [];

  return dentistasMock.filter((d: Dentista) => {
    const isDisponivel = d.disponibilidade === "Sim";
    const mesmEstado = d.endereco?.estado === beneficiario.estado;
    const isCompativel = d.programa === "Ambos" || d.programa === beneficiario.programaSocial;


    return isDisponivel && mesmEstado && isCompativel;
  });
};