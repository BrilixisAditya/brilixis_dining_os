import Navbar from '@/src/components/common/Navbar';
import React from 'react'
import { useAuth } from '@/src/context/AuthContext';
import { Outlet} from 'react-router-dom';

export const AuthLayout:React.FC = () => {

    const {user} = useAuth();


    return (
          <div className="min-h-screen bg-[#FAF9F6] text-[#1F2226] relative">
            <Navbar />
            <main className="max-w-xl mx-auto px-1 sm:px-4 py-8 relative z-10">
              <Outlet />
            </main>
          </div>
        );

}
