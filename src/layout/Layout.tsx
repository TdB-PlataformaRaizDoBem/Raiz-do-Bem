import React from 'react'
import { Header } from '../components/header/Header'
import { Outlet } from 'react-router-dom'

export const PublicLayout = () => {
  return (
    <div className='min-h-screen bg-white'>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export const AuthLayout = () => {
  return (
    <main className='min-h-screen bg-white'>
      <Outlet />
    </main>
  )
}

export const AppLayout = () => {
  return (
    <main className='min-h-screen bg-white'>
      <Outlet />
    </main>
  )
}