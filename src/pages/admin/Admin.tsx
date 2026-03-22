import { Route, Routes } from 'react-router-dom'
import Dashboard from '../dashboard/Dashboard'
import Coordenador from './Coordenador'
import { Beneficiarios } from '../gerenciaBeneficiarios/Beneficiarios'
import { Dentistas } from '../gerenciaDentistas/Dentistas'
import { PedidosAjuda } from '../pedidosAjuda/pedidosAjuda'

const Admin = () => {
  return (
    <Routes>
      <Route path='dashboard' element={<Dashboard />}/>
      <Route path='coordenadores' element={<Coordenador />} />
      <Route path='beneficiarios' element={<Beneficiarios />} />
      <Route path='dentistas' element={<Dentistas />} />
      <Route path='solicitacoes' element={<PedidosAjuda />} />
    </Routes>
  )
}

export default Admin