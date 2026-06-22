import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Network, BarChart3, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export default function Layout() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Copilot', path: '/copilot', icon: MessageSquare },
    { name: 'Graph Builder', path: '/graph', icon: Network },
    { name: '1-Click RCA', path: '/rca', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Header */}
      <header className="md:hidden flex-none flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))] bg-white border-b border-slate-200 shadow-sm z-40 relative">
        <div className="flex items-center gap-2 text-slate-900">
          <Logo className="w-7 h-7 text-slate-900" />
          <span className="font-bold text-lg tracking-tight">ForgeMind</span>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-slate-50">
        <div className="h-full overflow-y-auto w-full">
          <Outlet />
        </div>
      </main>

      {/* Desktop Sidebar & Mobile Bottom Nav */}
      <nav className="
        flex-none w-full bg-slate-900 border-t border-slate-800 
        md:w-20 lg:w-64 md:border-r md:border-t-0 md:border-slate-800 flex md:flex-col
        pb-[env(safe-area-inset-bottom)] md:order-first z-50 transition-all duration-300
      ">
        <div className="hidden md:flex items-center gap-3 p-6 lg:border-b lg:border-slate-800 justify-center lg:justify-start pt-[max(1.5rem,env(safe-area-inset-top))]">
          <Logo className="w-8 h-8 text-white shrink-0" />
          <div className="hidden lg:block">
            <span className="font-bold text-lg tracking-tight block text-white">ForgeMind</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Industrial</span>
          </div>
        </div>

        <div className="flex md:flex-col flex-1 justify-around md:justify-start p-2 md:p-4 gap-2 border-t border-slate-800 md:border-t-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.name}
              className={({ isActive }) => cn(
                "flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 p-2 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 relative",
                "text-[10px] lg:text-sm font-medium",
                isActive 
                  ? "text-blue-400 bg-slate-800" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="block md:hidden lg:block whitespace-nowrap">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-x-2 -top-px h-0.5 md:hidden bg-blue-500 rounded-full"
                    />
                  )}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabDesktop"
                      className="hidden md:block absolute inset-y-2 -left-px w-1 h-auto bg-blue-500 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        
        <div className="hidden lg:block p-4 mt-auto">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
             <span className="text-[10px] text-slate-400 mb-2 font-mono uppercase tracking-widest block">SYSTEM STATUS</span>
            <div className="flex items-center gap-2 text-sm text-green-400 font-bold">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="truncate">Graph Engine Online</span>
            </div>
            <div className="mt-2 text-[10px] uppercase font-bold tracking-widest text-slate-500 truncate">
              Ingested: 14 Docs, 32 Nodes
            </div>
          </div>
        </div>
      </nav>

    </div>
  );
}
