import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CoordDashboard from './Dashboard'

const Coord = () => {
  return (
    <Routes>
      <Route path='dashboard' element={<CoordDashboard />}/>
    </Routes>
  )
}

export default Coord