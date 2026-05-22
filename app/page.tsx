'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { 
  Tractor, 
  Mail, 
  Lock, 
  LogIn, 
  Building2, 
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const [isSignUp, setIsSignUp] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSupabaseConfigured()) {
      // Fallback for demo if not configured
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        router.push('/dashboard')
      }, 1500)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })
        if (signUpError) throw signUpError
        setError('Conta criada! Verifique seu email ou tente entrar.')
        setIsSignUp(false)
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'Erro na autenticação. Verifique suas credenciais.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Left Side: Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-surface-container-lowest z-10"
      >
        <div className="w-full max-w-[420px]">
          {/* Brand Header */}
          <div className="mb-12 text-center md:text-left">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-2 justify-center md:justify-start"
            >
              <div className="bg-primary-container p-2 rounded-xl">
                <Tractor className="text-[#86af99] w-8 h-8" />
              </div>
              <h1 className="font-display font-bold text-3xl text-primary tracking-tight">Curral Digital</h1>
            </motion.div>
            <p className="font-sans text-outline text-lg">Gestão inteligente para pecuária de precisão.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-4">
              <div className="bg-surface-container-low p-1 rounded-xl border border-outline-variant inline-flex">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isSignUp ? 'bg-primary text-white shadow-md' : 'text-outline hover:text-primary'}`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isSignUp ? 'bg-primary text-white shadow-md' : 'text-outline hover:text-primary'}`}
                >
                  Criar Conta
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 border rounded-xl flex items-center gap-3 text-sm ${error.includes('sucesso') || error.includes('criada') ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
              >
                {error.includes('sucesso') || error.includes('criada') ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="font-label text-sm uppercase tracking-wider text-outline font-semibold" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  placeholder="nome@fazenda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label text-sm uppercase tracking-wider text-outline font-semibold" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer transition-colors" 
                />
                <span className="text-sm text-outline group-hover:text-on-surface transition-colors">Lembrar de mim</span>
              </label>
              {!isSignUp && (
                <a href="#" className="text-sm font-semibold text-primary hover:underline transition-all">
                  Esqueceu a senha?
                </a>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-container text-[#c1ecd4] font-bold py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/10 disabled:opacity-70"
            >
              <span className="text-lg">
                {isLoading 
                  ? (isSupabaseConfigured() ? (isSignUp ? 'Criando...' : 'Entrando...') : 'Demo Mode...') 
                  : (isSignUp ? 'Criar Minha Conta' : 'Entrar')}
              </span>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-10">
            <div className="h-[1px] flex-grow bg-outline-variant"></div>
            <span className="font-label text-xs text-outline uppercase tracking-[0.2em]">Ou continue com</span>
            <div className="h-[1px] flex-grow bg-outline-variant"></div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-xl hover:bg-surface-container-low hover:border-outline transition-all group overflow-hidden relative">
              <Image 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxMRYM4Z6aVhYBlqnLFrcZa0qBSSf1sx07jqmnDjIRGyijBKVGDYL0otAfjZFfCL0rVr8eUSGam6q7a3kRUmPUz3i78i8dcPoV0tWHMK3462tMgEpeT9AJoL_ariTtCjFRAkT9Ire1oeoA2A5LiD_gRH85aGVrM0AVMMkO1w6VXyoAONblrI9FDZ-k9mBR5JqWT0MSmx_q4fD6GcETWz5Mrk7V15m9VMJ6oy7UD9gLmu5_-7P-U_Eko21GhHFwHynbiW3N-iua7s79" 
                alt="Google" 
                width={20} 
                height={20}
                className="grayscale group-hover:grayscale-0 transition-all duration-300"
              />
              <span className="text-sm font-semibold text-outline group-hover:text-on-surface">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 border border-outline-variant rounded-xl hover:bg-surface-container-low hover:border-outline transition-all group">
              <Building2 className="w-5 h-5 text-outline group-hover:text-primary transition-colors" />
              <span className="text-sm font-semibold text-outline group-hover:text-on-surface">SSO Corporativo</span>
            </button>
          </div>

          {/* Footer Links */}
          <footer className="mt-12 pt-8 border-t border-outline-variant flex flex-wrap justify-center md:justify-start gap-6">
            <a href="#" className="text-xs font-semibold text-outline hover:text-primary transition-colors uppercase tracking-wider">Termos de Uso</a>
            <a href="#" className="text-xs font-semibold text-outline hover:text-primary transition-colors uppercase tracking-wider">Privacidade</a>
            <a href="#" className="text-xs font-semibold text-outline hover:text-primary transition-colors uppercase tracking-wider">Suporte</a>
          </footer>
        </div>
      </motion.div>

      {/* Right Side: Imagery/Visuals */}
      <div className="hidden md:flex md:w-1/2 relative bg-primary items-end overflow-hidden">
        {/* Background Image */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcU1i1Q-UzGd0JNzXtaCNyzNlFSM10XImm4OEGQ4YGp2nu_GeRZnzP8D7n6sKAVWNI8EjCIgURSthsqJxN5rpXcdtp9OMyT6Je-T4I3nDctY9AvdTV4uY4egrr6mRfTVD-Zec7Cay18Z19iqVaEpqHQmN-trWXFr8gZ6KGCxeS-qwRx5p8bIIV3u3Jj3DM7PPla14tgKeg0otp_LEY8wYZqbse4hkK2PhFjcwL85ss9z6uYlHrSFcGgMTbKPKnh8A0kD52teat4Jip"
            alt="Pecuária de Precisão"
            fill
            className="object-cover mix-blend-soft-light"
            priority
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent z-10"></div>

        {/* Content on Image */}
        <div className="relative p-12 lg:p-20 z-20 w-full mb-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl max-w-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#c1ecd4]/20 p-1.5 rounded-lg border border-[#c1ecd4]/30">
                <CheckCircle2 className="w-5 h-5 text-[#a5d0b9]" />
              </div>
              <span className="font-label text-xs text-[#c1ecd4] uppercase tracking-[0.3em] font-bold">Sistema de Alta Precisão</span>
            </div>
            
            <h2 className="font-display text-4xl lg:text-5xl text-white font-bold mb-6 leading-tight tracking-tight">
              O controle total do seu rebanho na palma da mão.
            </h2>
            
            <p className="font-sans text-lg text-[#86af99] mb-10 leading-relaxed font-medium">
              Monitore peso, saúde e localização com a tecnologia que transforma a produtividade no campo de forma sustentável.
            </p>

            {/* Stats Preview */}
            <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/10">
              <div className="space-y-1">
                <p className="font-display text-3xl text-white font-bold tracking-tight">+15%</p>
                <p className="font-label text-[10px] text-[#c1ecd4] uppercase tracking-widest font-semibold opacity-80">Conversão Alimentar</p>
              </div>
              <div className="space-y-1">
                <p className="font-display text-3xl text-white font-bold tracking-tight">24/7</p>
                <p className="font-label text-[10px] text-[#c1ecd4] uppercase tracking-widest font-semibold opacity-80">Monitoramento Realtime</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '48px 48px' }}>
        </div>
      </div>
    </main>
  )
}
