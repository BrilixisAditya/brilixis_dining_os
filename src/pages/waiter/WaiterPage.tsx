import Navbar from '@/src/components/common/Navbar'
import React from 'react'
import { WaiterTerminal } from './components/WaiterTerminal'
import { useAuth } from '@/src/context/AuthContext'

export const WaiterPage:React.FC = () => {

  const {user} = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
        <Navbar isGuest={user === null} />
        <main className="max-w-7xl mx-auto py-4">
          <WaiterTerminal />
        </main>
      </div>
  )
}
