'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Tractor, 
  LayoutDashboard, 
  PawPrint, 
  ClipboardList, 
  LineChart, 
  Settings, 
  LifeBuoy,
  Bell,
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  ArrowLeftRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [selectedFarm, setSelectedFarm] = React.useState<{ name: string } | null>(null)

  React.useEffect(() => {
    const farmId = localStorage.getItem('selectedFarmId')
    if (farmId) {
      const fetchFarm = async () => {
        const { data } = await supabase.from('farms').select('name').eq('id', farmId).single()
        if (data) setSelectedFarm(data)
      }
      fetchFarm()
    }
  }, [pathname])

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Rebanho', icon: PawPrint, href: '/dashboard/herd' },
    { label: 'Curral', icon: ClipboardList, href: '/dashboard/corral' },
    { label: 'Gestão', icon: ClipboardList, href: '/dashboard/management' },
    { label: 'Relatórios', icon: LineChart, href: '/dashboard/reports' },
  ]

  const bottomNavItems = [
    { label: 'Configurações', icon: Settings, href: '/dashboard/settings' },
    { label: 'Suporte', icon: LifeBuoy, href: '/dashboard/support' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 bg-surface-container-low border-r border-outline-variant flex flex-col py-6 px-4 z-50 transition-transform duration-300 lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <Tractor className="text-on-primary-container w-6 h-6" />
            </div>
            <div className="overflow-hidden flex-1">
              <h1 className="text-lg font-bold text-primary truncate">
                {selectedFarm ? selectedFarm.name : 'Curral Digital'}
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-outline">
                {selectedFarm ? 'Pecuária de Corte' : 'Gerenciamento'}
              </p>
            </div>
          </div>
          {pathname !== '/dashboard' && (
            <Link 
              href="/dashboard" 
              className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary hover:bg-primary/5 p-2 rounded-lg transition-all border border-primary/10"
            >
              <ArrowLeftRight className="w-3 h-3" />
              TROCAR FAZENDA
            </Link>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm",
                  isActive 
                    ? "bg-primary-container text-on-primary-container shadow-sm shadow-primary/5" 
                    : "text-outline hover:bg-surface-container-high hover:text-on-surface"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-on-primary-container" : "text-outline")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-outline-variant pt-6 flex flex-col gap-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-outline hover:bg-surface-container-high hover:text-on-surface transition-all font-medium text-sm"
            >
              <item.icon className="w-5 h-5 text-outline" />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* Top Header */}
      <header className="sticky top-0 z-30 flex justify-between items-center w-full lg:pl-64 h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant px-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-container transition-colors"
          >
            <Menu className="w-6 h-6 text-on-surface-variant" />
          </button>
          <span className="text-xl font-bold text-primary tracking-tight hidden sm:block">AgroPrecision</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-outline">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container transition-colors text-outline">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="h-6 w-[1px] bg-outline-variant mx-1"></div>
          <div className="flex items-center gap-3 ml-1">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-on-surface">Junior Alves</p>
              <p className="text-[10px] text-outline font-semibold uppercase tracking-wider">Gerente</p>
            </div>
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-outline-variant relative">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArs0G4ooF_IFPAKuMWjKyWalHrodm_Z-VXXK2DRqDtMEzMBPvRouzt3x_pWNpujV2RIar0MMDOBriBroxNfbqmm5xJBNsyGr7pe6UWyyCaza3NjOaC-S1qL5ocagpZSvBODMOT33v0k7TID-i81Ult6FrEHkM7k9SGRYv5q3bHK5eTIyFfYukYPnD-hEdnjhpUuwvLi4ztsNyzck3cePcMMkS6d-n46jZqHZFwHSHGEzglwre-CwrUQjlamc4J6fxwQLqnbNHfb0JL" 
                alt="Manager Profile" 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={cn(
        "transition-all duration-300 lg:pl-64 min-h-[calc(100vh-64px)] pt-4",
      )}>
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {children}
        </div>
      </main>
    </div>
  )
}
