import Navbar from '@/src/components/common/Navbar';
import React from 'react'
import { useAuth } from '@/src/context/AuthContext';
import { RoleLoginScreen } from './RoleLoginScreen';

export const LoginPage:React.FC = () => {

    const {user} = useAuth();

    return (
          <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
            <Navbar />
            <main className="max-w-xl mx-auto px-4 py-8 relative z-10">
              <RoleLoginScreen />
            </main>
          </div>
        );

}
