import Navbar from '@/src/components/common/Navbar'
import React from 'react'
import { ManagerDashboard } from './components/ManagerDashboard'
import { useAuth } from '@/src/context/AuthContext'

export const ManagerPage:React.FC = () => {
    const {user} = useAuth();
  return (
     <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
        <Navbar />
        <main className="max-w-7xl mx-auto py-4">
          <ManagerDashboard />
        </main>
      </div>
  )
}
