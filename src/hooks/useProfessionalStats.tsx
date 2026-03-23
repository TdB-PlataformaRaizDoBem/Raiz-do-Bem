import React from 'react';
import { dentistasMock } from '../data/dentistasData';

export const useProfessionalStats = () => {
  return React.useMemo(() => ({
    dentistasDisponiveis: dentistasMock.filter(d => d.disponibilidade === "Sim").length,
    totalDentistas: dentistasMock.length
  }), [dentistasMock]);
};