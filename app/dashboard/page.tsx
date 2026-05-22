'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { 
  Plus, 
  MapPin, 
  Ruler, 
  ChevronRight, 
  Loader2,
  Building2,
  ArrowRight,
  User,
  ExternalLink
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface Farm {
  id: string
  name: string
  corporate_name: string | null
  city: string | null
  state: string | null
  total_area: number | null
  pasture_count: number | null
  manager_name: string | null
}

export default function MyFarmsPage() {
  const router = useRouter()
  const [farms, setFarms] = React.useState<Farm[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchFarms = React.useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      setError('Supabase não configurado.')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      setFarms(data || [])
      
      // If no farms, redirect to new farm creation
      if (!data || data.length === 0) {
        router.push('/dashboard/new')
      }
    } catch (err: any) {
      console.error('Error fetching farms:', err)
      setError(err.message || 'Erro ao carregar fazendas.')
    } finally {
      setLoading(false)
    }
  }, [router])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchFarms()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchFarms])

  const handleEnterFarm = (farmId: string) => {
    // For now, let's just go to the herd page or a specific farm dashboard
    // We could save the selected farm ID in localStorage or a context here
    localStorage.setItem('selectedFarmId', farmId)
    router.push('/dashboard/herd')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-outline font-bold uppercase tracking-widest text-xs">Carregando suas Unidades...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h2 className="text-4xl font-bold text-primary tracking-tight">Minhas Fazendas</h2>
            <p className="text-outline mt-1 font-medium italic">Selecione uma unidade produtiva para gerenciar seu rebanho.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/new')}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/10 flex items-center gap-2 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            Nova Fazenda
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 mb-8 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm, index) => (
            <motion.div
              key={farm.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleEnterFarm(farm.id)}
              className="group bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />

              <div className="flex items-start justify-between mb-4">
                <div className="bg-primary/10 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-outline uppercase tracking-widest bg-surface-container rounded-full px-3 py-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {farm.city}, {farm.state?.substring(0, 2).toUpperCase()}
                </div>
              </div>

              <h3 className="text-xl font-bold text-primary mb-1 group-hover:text-primary transition-colors">{farm.name}</h3>
              <p className="text-outline text-sm font-medium mb-6 line-clamp-1 opacity-80">{farm.corporate_name || 'Razão Social não informada'}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-outline-variant">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-tighter">Área Total</span>
                  <div className="flex items-center gap-1.5 font-bold text-primary">
                    <Ruler className="w-3.5 h-3.5 text-outline" />
                    <span>{farm.total_area?.toLocaleString() || '--'} <small className="text-[10px] opacity-60">HA</small></span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-tighter">Responsável</span>
                  <div className="flex items-center gap-1.5 font-bold text-primary italic">
                    <User className="w-3.5 h-3.5 text-outline" />
                    <span className="truncate">{farm.manager_name || '--'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-1 rounded">
                  {farm.pasture_count || 0} Pastos ativos
                </div>
                <div className="flex items-center gap-1 text-primary font-bold text-sm group-hover:translate-x-1 transition-transform">
                  Entrar Unit
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Add Shortcut Card */}
          <button 
            onClick={() => router.push('/dashboard/new')}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant bg-surface-container-low rounded-2xl hover:bg-surface-container transition-all group min-h-[250px]"
          >
            <div className="w-12 h-12 rounded-full border-2 border-outline-variant flex items-center justify-center mb-4 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <p className="font-bold text-outline group-hover:text-primary">Cadastrar Nova Fazenda</p>
            <p className="text-xs text-outline/60 font-medium mt-1">Expanda sua produção no sistema.</p>
          </button>
        </div>

        {/* Global Footer */}
        <footer className="mt-20 pt-8 border-t border-outline-variant text-center opacity-40">
          <p className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">Curral Digital • Enterprise Precision Farming</p>
        </footer>
      </motion.div>
    </DashboardLayout>
  )
}
