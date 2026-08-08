import React from 'react'
import { KitchenPortal } from './components/KitchenPortal'
import Navbar from '@/src/components/common/Navbar';
import { useAuth } from '@/src/context/AuthContext';

const KitchenPage:React.FC = () => {
  const {user} = useAuth();
  return (
     <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
            <Navbar isGuest={user === null} />
            <main className="max-w-7xl mx-auto py-4">
              <KitchenPortal />
            </main>
          </div>
  )
}

export default KitchenPage