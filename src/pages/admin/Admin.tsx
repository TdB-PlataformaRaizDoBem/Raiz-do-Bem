import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'
import Coordenador from './Coordenador'

const Admin = () => {
  return (
    <Routes>
      <Route path='dashboard' element={<Dashboard />}/>
      <Route path='coordenadores' element={<Coordenador />} />
    </Routes>
  )
}

export default Admin