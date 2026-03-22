import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from '../dashboard/Dashboard'
import { Beneficiarios } from '../gerenciaBeneficiarios/Beneficiarios'
import { Dentistas } from '../gerenciaDentistas/Dentistas'
import { PedidosAjuda } from '../pedidosAjuda/pedidosAjuda'

const Coord = () => {
  return (
    <Routes>
      <Route path='dashboard' element={<Dashboard />}/>
      <Route path='beneficiarios' element={<Beneficiarios />} />
      <Route path='dentistas' element={<Dentistas />} />
      <Route path='solicitacoes' element={<PedidosAjuda />} />

    </Routes>
  )
}

export default Coord