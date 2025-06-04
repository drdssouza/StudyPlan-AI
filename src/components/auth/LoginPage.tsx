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
        // Fazer login
        console.log('Tentando login com:', formData.email);
        const result = await authService.signIn(formData.email, formData.password);
        
        if (result.success) {
          setSuccess('Login realizado com sucesso!');
          console.log('Login bem-sucedido:', result.user);
          // Chamar onLogin após pequeno delay para mostrar mensagem de sucesso
          setTimeout(() => {
            onLogin();
          }, 1000);
        } else {
          setError(result.error || 'Erro ao fazer login');
        }
      } else {
        // Criar conta
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        
        const result = await authService.signUp(formData.email, formData.password, formData.name);
        if (result.success) {
          setSuccess('Conta criada com sucesso! Agora faça login.');
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', confirmPassword: '', name: '' });
        } else {
          setError(result.error || 'Erro ao criar conta');
        }
      }
    } catch (err) {
      console.error('Erro no handleSubmit:', err);
      setError('Erro inesperado. Tente novamente.');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await authService.signInWithGoogle();
      if (result.success) {
        setSuccess('Login com Google realizado!');
        setTimeout(() => {
          onLogin();
        }, 1000);
      } else {
        setError(result.error || 'Erro ao conectar com Google');
      }
    } catch (err) {
      setError('Erro ao conectar com Google');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
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

            {/* Credenciais de Teste */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🔑 Credenciais para Teste:</h4>
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> teste@email.com<br />
                <strong>Senha:</strong> 123456
              </p>
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

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors mb-6 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">
                {loading ? 'Conectando...' : 'Continuar com Google'}
              </span>
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

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
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Seu nome completo"
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
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="seu@email.com"
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
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
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
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="••••••••"
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