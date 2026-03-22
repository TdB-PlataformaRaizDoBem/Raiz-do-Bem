import React from 'react'
import { PedidoAjuda } from '../data/pedidosAjudaData'
import { dentistasMock } from '../data/dentistasData'
import { beneficiariosData } from '../data/beneficiariosData'

export const useStats = () => {
  
  return React.useMemo(() => {
    // Contagens Básicas
    const pedidosPendentes = PedidoAjuda.filter(p => p.situacao === "Pendente").length;
    const beneficiarios = beneficiariosData.length;
    const dentistasDisponiveis = dentistasMock.filter(d => d.disponibilidade === "S").length;

    // Filtros por programas sociais
    const qtdTdb = beneficiariosData.filter(p => p.programaSocial === "Turma do Bem").length;
    const qtdAdb = beneficiariosData.filter(p => p.programaSocial === "Apolônias do Bem").length;

    // peso de oras
    const peso_horas_tdb = 6;
    const peso_horas_adb = 20;

    // cálculo proxy 
    const totalHorasImpactadas = (qtdTdb * peso_horas_tdb) + (qtdAdb * peso_horas_adb);

    return {
      pedidosPendentes,
      beneficiarios,
      dentistasDisponiveis,
      totalHorasImpactadas,
      qtdTdb,
      qtdAdb
    }
  }, [PedidoAjuda, beneficiariosData, dentistasMock])
}