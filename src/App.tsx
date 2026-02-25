import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/home/Home'
import About from './pages/about/About'
import Team from './pages/Team/Team'
import Faq from './pages/faq/Faq'
import Contact from './pages/contact/Contact'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sobre' element={<About />} />
        <Route path='/integrantes' element={<Team />} />
        <Route path='/faq' element={<Faq />} />
        <Route path='/contato' element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App