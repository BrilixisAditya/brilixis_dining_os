import Navbar from '@/src/components/common/Navbar';
import React from 'react'
import { OwnerDashboard } from './components/OwnerDashboard';
import { useAuth } from '@/src/context/AuthContext';

export const OwnerPage:React.FC = () => {
  const {user} = useAuth();
    return (
          <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
            <Navbar isGuest={user === null} />
            <main className="max-w-7xl mx-auto py-4">
              <OwnerDashboard />
            </main>
          </div>
        );
}
