import { Route, Routes } from 'react-router-dom'
import Dashboard from '../dashboard/Dashboard'
import Coordenador from './Colaborador'
import { Beneficiarios } from '../gerenciaBeneficiarios/Beneficiarios'
import { Dentistas } from '../gerenciaDentistas/Dentistas'
import { PedidosAjuda } from '../pedidosAjuda/pedidosAjuda'
import {Designacao} from '../designacao/Designacao'

const Admin = () => {
  return (
    <Routes>
      <Route path='dashboard' element={<Dashboard />}/>
      <Route path='colaboradores' element={<Coordenador />} />
      <Route path='beneficiarios' element={<Beneficiarios />} />
      <Route path='dentistas' element={<Dentistas />} />
      <Route path='solicitacoes' element={<PedidosAjuda />} />
      <Route path='designacao' element={<Designacao />} />
    </Routes>
  )
}

export default Admin