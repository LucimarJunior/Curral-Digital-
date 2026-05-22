'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { 
  Info, 
  MapPin, 
  Ruler, 
  User, 
  Save, 
  X,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard-layout'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type FarmInsert = Database['public']['Tables']['farms']['Insert']

export default function FarmRegistrationPage() {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const [formData, setFormData] = React.useState({
    name: '',
    corporate_name: '',
    document_number: '',
    zip_code: '',
    address: '',
    state: 'Mato Grosso',
    city: '',
    total_area: '',
    productive_area: '',
    pasture_count: '',
    static_capacity: '',
    manager_name: '',
    phone: '',
    email: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    // Map IDs if they differ from form data keys (though I should match them for ease)
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSave = async () => {
    if (!isSupabaseConfigured()) {
      setStatus('error')
      setErrorMessage('Supabase não está configurado. Por favor, configure as variáveis de ambiente.')
      return
    }

    if (!formData.name) {
      setStatus('error')
      setErrorMessage('O nome da fazenda é obrigatório.')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.')
      }

      const parseNum = (val: string) => {
        const parsed = parseFloat(val)
        return isNaN(parsed) ? null : parsed
      }

      const parseIntNum = (val: string) => {
        const parsed = parseInt(val)
        return isNaN(parsed) ? null : parsed
      }

      const farmToInsert: any = {
        owner_id: user.id,
        name: formData.name,
        corporate_name: formData.corporate_name || null,
        document_number: formData.document_number || null,
        zip_code: formData.zip_code || null,
        address: formData.address || null,
        state: formData.state || null,
        city: formData.city || null,
        total_area: formData.total_area ? parseNum(formData.total_area) : null,
        productive_area: formData.productive_area ? parseNum(formData.productive_area) : null,
        pasture_count: formData.pasture_count ? parseIntNum(formData.pasture_count) : null,
        static_capacity: formData.static_capacity ? parseIntNum(formData.static_capacity) : null,
        manager_name: formData.manager_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
      }

      const { data: insertedData, error: insertError } = await (supabase.from('farms') as any)
        .insert(farmToInsert)
        .select()
        .single()

      if (insertError) throw insertError

      if (insertedData) {
        localStorage.setItem('selectedFarmId', insertedData.id)
      }

      setStatus('success')
      // Wait a moment then redirect
      setTimeout(() => {
        router.push('/dashboard/herd')
      }, 1500)
    } catch (err: any) {
      console.error('Error saving farm (Full):', JSON.stringify(err, null, 2))
      console.error('Raw error:', err)
      
      let message = 'Ocorreu um erro ao salvar a fazenda.'
      
      // Handle Supabase/PostgREST specific error for missing table
      if (err.code === 'PGRST205' || (err.message && err.message.includes("public.farms"))) {
        message = 'A tabela "farms" não foi encontrada. Você precisa executar a migração no SQL Editor do Supabase.'
      } else if (err.message) {
        message = err.message
      }

      const details = err.details ? ` - ${err.details}` : ''
      const hint = err.hint ? ` (Dica: ${err.hint})` : ''
      
      setStatus('error')
      setErrorMessage(`${message}${details}${hint}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-primary tracking-tight">Cadastro de Fazenda</h2>
            <p className="text-outline mt-1 font-medium">Registre uma nova unidade produtiva no sistema Curral Digital.</p>
          </div>
          <div className="flex gap-3">
            <button 
              disabled={loading}
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 border border-outline-variant text-outline font-bold rounded-xl hover:bg-surface-container transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/10 flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Salvando...' : 'Salvar Fazenda'}
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {status === 'success' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-semibold">Fazenda salva com sucesso!</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="flex items-start gap-4 text-red-700">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg mb-2">Ops! Erro de Banco de Dados</p>
                <p className="font-medium text-red-600/90 leading-relaxed">
                  {errorMessage}
                </p>
                
                {errorMessage.includes('tabela "farms" não foi encontrada') && (
                  <div className="mt-6 p-4 bg-white/50 rounded-xl border border-red-100">
                    <p className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wider">Como resolver:</p>
                    <ol className="text-sm text-red-700 space-y-2 list-decimal ml-4 font-medium">
                      <li>Acesse seu painel no <strong>Supabase</strong>.</li>
                      <li>Vá em <strong>SQL Editor</strong>.</li>
                      <li>Clique em <strong>New Query</strong>.</li>
                      <li>Cole o código SQL abaixo e clique em <strong>Run</strong>.</li>
                    </ol>
                    
                    <div className="mt-4 relative group">
                      <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-[10px] overflow-x-auto font-mono max-h-40">
{`CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  corporate_name TEXT,
  document_number TEXT,
  zip_code TEXT,
  address TEXT,
  state TEXT,
  city TEXT,
  total_area DECIMAL(10,2),
  productive_area DECIMAL(10,2),
  pasture_count INTEGER,
  static_capacity INTEGER,
  manager_name TEXT,
  phone TEXT,
  email TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own farms" ON farms FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own farms" ON farms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own farms" ON farms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own farms" ON farms FOR DELETE USING (auth.uid() = owner_id);`}
                      </pre>
                      <button 
                        onClick={() => {
                          const sql = `CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  corporate_name TEXT,
  document_number TEXT,
  zip_code TEXT,
  address TEXT,
  state TEXT,
  city TEXT,
  total_area DECIMAL(10,2),
  productive_area DECIMAL(10,2),
  pasture_count INTEGER,
  static_capacity INTEGER,
  manager_name TEXT,
  phone TEXT,
  email TEXT,
  inserted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own farms" ON farms FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert their own farms" ON farms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their own farms" ON farms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete their own farms" ON farms FOR DELETE USING (auth.uid() = owner_id);`;
                          navigator.clipboard.writeText(sql);
                          alert('SQL copiado para a área de transferência!');
                        }}
                        className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors text-white"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Form Layout (Bento-style Grid) */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Section 1: Basic Information */}
          <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
              <div className="bg-primary-container/20 p-1.5 rounded-lg">
                <Info className="text-primary w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-primary">Informações Básicas</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Nome da Fazenda</label>
                <input 
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="Ex: Fazenda Santa Fé" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Razão Social</label>
                <input 
                  id="corporate_name"
                  value={formData.corporate_name}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="Nome empresarial" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">CNPJ / CPF</label>
                <input 
                  id="document_number"
                  value={formData.document_number}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="00.000.000/0000-00" 
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Image Placeholder / Visual Context */}
          <div className="col-span-12 lg:col-span-5 relative h-[300px] lg:h-auto min-h-[300px] rounded-2xl overflow-hidden border border-outline-variant shadow-sm group">
            <Image 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVqcqvjrQg19_QBHVJY9SlKosjYwzpdxm1xnznvh2qF8I_WCjWTGuNG23uBO8bEjBEbm_nGgr195TszLlhdX_dOwlQ4UXbR1Zf3m3vVWj5x5Ee-nlBRSxM5hNlS2WRygpOUuvL35ABrIP8S1E8jsL8NK4ggWcVOX9J8D4hj5Ad1P_fmnCuaLHMZ2Dmv2YrkXlCNYdfp-xgKGw-obL5nW2ctENyVZUEyGW0E0dCq40zm3nXTThO87jvIEm6qW__yEaBX4UHOJBHm5_W" 
              alt="Farm Aerial View" 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-8 z-10">
              <div className="text-white">
                <p className="font-bold text-2xl mb-1">Mapeamento Geográfico</p>
                <p className="text-sm text-on-primary-container font-medium opacity-90">Sua fazenda será monitorada via satélite para precisão zootécnica.</p>
              </div>
            </div>
          </div>
          
          {/* Section 2: Location */}
          <div className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
              <div className="bg-primary-container/20 p-1.5 rounded-lg">
                <MapPin className="text-primary w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-primary">Localização</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">CEP / Coordenadas</label>
                <input 
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="78000-000" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Endereço / Acesso Rodoviário</label>
                <input 
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="Ex: Rodovia BR-163, KM 45" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Estado</label>
                <div className="relative">
                  <select 
                    id="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none font-medium"
                  >
                    <option>Mato Grosso</option>
                    <option>Goiás</option>
                    <option>Mato Grosso do Sul</option>
                    <option>Minas Gerais</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-2 md:col-span-1">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Cidade</label>
                <input 
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="Cuiabá" 
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Technical Details */}
          <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
              <div className="bg-primary-container/20 p-1.5 rounded-lg">
                <Ruler className="text-primary w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-primary">Detalhes Técnicos</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Área Total (ha)</label>
                <div className="relative">
                  <input 
                    id="total_area"
                    value={formData.total_area}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-12 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-right" 
                    placeholder="0.00" 
                    type="number"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">HA</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Área Produtiva (ha)</label>
                <div className="relative">
                  <input 
                    id="productive_area"
                    value={formData.productive_area}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-4 pr-12 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium text-right" 
                    placeholder="0.00" 
                    type="number"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-outline">HA</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Número de Pastos</label>
                <input 
                  id="pasture_count"
                  value={formData.pasture_count}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="0" 
                  type="number"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Capacidade Estática (UA)</label>
                <input 
                  id="static_capacity"
                  value={formData.static_capacity}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="0" 
                  type="number"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Contact/Management */}
          <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-outline-variant pb-4">
              <div className="bg-primary-container/20 p-1.5 rounded-lg">
                <User className="text-primary w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-primary">Contato & Gestão</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Nome do Gerente / Responsável</label>
                <input 
                  id="manager_name"
                  value={formData.manager_name}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="Nome Completo" 
                  type="text"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">Telefone / WhatsApp</label>
                <input 
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="(00) 00000-0000" 
                  type="tel"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest font-bold text-outline">E-mail</label>
                <input 
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium" 
                  placeholder="contato@fazenda.com.br" 
                  type="email"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-outline-variant text-center">
          <p className="text-xs font-bold text-outline uppercase tracking-[0.2em]">AgroPrecision System © 2024</p>
          <p className="text-[10px] text-outline/60 mt-1 uppercase tracking-widest">Sistema de Alta Precisão para Pecuária de Corte</p>
        </footer>
      </motion.div>
    </DashboardLayout>
  )
}

