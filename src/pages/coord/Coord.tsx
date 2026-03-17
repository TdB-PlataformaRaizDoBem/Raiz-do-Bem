import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CoordDashboard from './Dashboard'
import { Beneficiarios } from '../gerenciaBeneficiarios/Beneficiarios'
import { Dentistas } from '../gerenciaDentistas/Dentistas'

const Coord = () => {
  return (
    <Routes>
      <Route path='dashboard' element={<CoordDashboard />}/>
      <Route path='beneficiarios' element={<Beneficiarios />} />
      <Route path='dentistas' element={<Dentistas />} />
    </Routes>
  )
}

export default Coord