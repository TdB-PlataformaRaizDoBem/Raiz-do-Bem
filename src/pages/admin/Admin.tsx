import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import Coordenador from './Coordenador'
import { Beneficiarios } from './Beneficiarios'

const Admin = () => {
  return (
    <Routes>
      <Route path='dashboard' element={<Dashboard />}/>
      <Route path='coordenadores' element={<Coordenador />} />
      <Route path='beneficiarios' element={<Beneficiarios />} />
    </Routes>
  )
}

export default Admin