import { useState } from "react";
import { designacaoData } from "../data/designacaoData"; // Importe o que criamos acima
import { type Beneficiario } from "../data/beneficiariosData";
import { type Dentista } from "../data/dentistasData";

export const useDesignacao = () => {
  // Inicializa com os dados cruzados
  const [pendentes, setPendentes] = useState<Beneficiario[]>(designacaoData);
  
  const [beneficiarioEmFoco, setBeneficiarioEmFoco] = useState<Beneficiario | null>(null);
  const [dentistaSelecionado, setDentistaSelecionado] = useState<Dentista | null>(null);
  const [acaoPendente, setAcaoPendente] = useState<string | null>(null);

  const solicitarDesignacao = (b: Beneficiario, d: Dentista) => {
    setBeneficiarioEmFoco(b);
    setDentistaSelecionado(d);
    setAcaoPendente("designar");
  };

  const confirmarDesignacao = () => {
    if (!beneficiarioEmFoco) return;
    
    // Remove da lista ao confirmar
    setPendentes(prev => prev.filter(b => b.id !== beneficiarioEmFoco.id));
    setAcaoPendente(null);
    alert("Designação realizada com sucesso!");
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