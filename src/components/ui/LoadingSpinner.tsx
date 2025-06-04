'use client';
import React, { useState } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Zap } from 'lucide-react';
import { authService } from '@/services/auth';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const result = await authService.signIn(formData.email, formData.password);
        if (result.success) {
          setSuccess('Login realizado com sucesso!');
          setTimeout(() => onLogin(), 1000);
        } else {
          setError(result.error || 'Erro ao fazer login');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        
        const result = await authService.signUp(formData.email, formData.password, formData.name);
        if (result.success) {
          setSuccess('Conta criada! Verifique seu email para confirmar.');
          setIsLogin(true);
        } else {
          setError(result.error || 'Erro ao criar conta');
        }
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">StudyPlan AI</h1>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Marketing Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Transforme seu
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> estudo </span>
                com IA
              </h1>
              <p className="text-xl text-gray-600 mt-4 leading-relaxed">
                Planos de estudo personalizados baseados em editais de concursos, 
                otimizados com inteligência artificial para maximizar seus resultados.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Análise Inteligente</h3>
                  <p className="text-gray-600">IA analisa editais e cria cronogramas personalizados</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Personalização Total</h3>
                  <p className="text-gray-600">Adapte às suas horas disponíveis e preferências</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Progresso Monitorado</h3>
                  <p className="text-gray-600">Acompanhe seu desenvolvimento em tempo real</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white/50 backdrop-blur rounded-xl p-6 border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">+500 concurseiros</p>
                  <p className="text-sm text-gray-600">já melhoraram seus estudos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {isLogin ? 'Entrar na sua conta' : 'Criar conta gratuita'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isLogin ? 'Bem-vindo de volta!' : 'Comece a estudar de forma inteligente'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Seu nome completo"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="••••••••"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>{isLogin ? 'Entrar' : 'Criar conta'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  {isLogin ? 'Criar conta gratuita' : 'Fazer login'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;