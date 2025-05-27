'use client';
import './components.css';
import { Inter } from 'next/font/google';
import SideBar from '../sidebar';
import './dashboardLayout.css'
import { useAuth } from '../loginService';

const inter = Inter({ subsets: ['latin'] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} flex flex-row max-h-screen overflow-y-hidden`}>
      <SideBar />
      <div className='flex justify-center max-h-svh w-full items-center'>
        {children}
      </div>
    </div>
  );
}
