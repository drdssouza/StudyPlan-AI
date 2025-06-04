'use client';
import React, { useState } from 'react';
import { BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Zap, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth';

interface LoginPageProps {
  onLogin: () => void;
}

type LoginView = 'login' | 'register' | 'confirm' | 'forgot-password' | 'reset-password';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<LoginView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    confirmationCode: '',
    newPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (currentView === 'register') {
      if (!formData.name.trim()) {
        setError('Nome é obrigatório');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Senha deve ter pelo menos 8 caracteres');
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    
    if (currentView !== 'forgot-password' && currentView !== 'confirm' && !formData.password.trim()) {
      setError('Senha é obrigatória');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      switch (currentView) {
        case 'login':
          const loginResult = await authService.signIn(formData.email, formData.password);
          if (loginResult.success) {
            setSuccess('Login realizado com sucesso!');
            setTimeout(() => onLogin(), 1000);
          } else {
            setError(loginResult.error || 'Erro ao fazer login');
          }
          break;

        case 'register':
          const registerResult = await authService.signUp(formData.email, formData.password, formData.name);
          if (registerResult.success) {
            if (registerResult.requiresConfirmation) {
              setSuccess('Conta criada! Verifique seu email para o código de confirmação.');
              setCurrentView('confirm');
            } else {
              setSuccess('Conta criada com sucesso! Faça login.');
              setCurrentView('login');
            }
            setFormData({ ...formData, password: '', confirmPassword: '' });
          } else {
            setError(registerResult.error || 'Erro ao criar conta');
          }
          break;

        case 'confirm':
          const confirmResult = await authService.confirmSignUp(formData.email, formData.confirmationCode);
          if (confirmResult.success) {
            setSuccess('Email confirmado com sucesso! Agora você pode fazer login.');
            setCurrentView('login');
            setFormData({ ...formData, confirmationCode: '' });
          } else {
            setError(confirmResult.error || 'Erro ao confirmar email');
          }
          break;

        case 'forgot-password':
          const forgotResult = await authService.forgotPassword(formData.email);
          if (forgotResult.success) {
            setSuccess('Código de recuperação enviado para seu email!');
            setCurrentView('reset-password');
          } else {
            setError(forgotResult.error || 'Erro ao enviar código');
          }
          break;

        case 'reset-password':
          const resetResult = await authService.confirmForgotPassword(
            formData.email, 
            formData.confirmationCode, 
            formData.newPassword
          );
          if (resetResult.success) {
            setSuccess('Senha redefinida com sucesso! Faça login com a nova senha.');
            setCurrentView('login');
            setFormData({ ...formData, confirmationCode: '', newPassword: '', password: formData.newPassword });
          } else {
            setError(resetResult.error || 'Erro ao redefinir senha');
          }
          break;
      }
    } catch (err) {
      console.error('Erro no handleSubmit:', err);
      setError('Erro inesperado. Tente novamente.');
    }
    
    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    const result = await authService.resendConfirmationCode(formData.email);
    if (result.success) {
      setSuccess('Novo código enviado para seu email!');
    } else {
      setError(result.error || 'Erro ao reenviar código');
    }
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const getTitle = () => {
    switch (currentView) {
      case 'login': return 'Entrar na sua conta';
      case 'register': return 'Criar conta gratuita';
      case 'confirm': return 'Confirmar email';
      case 'forgot-password': return 'Recuperar senha';
      case 'reset-password': return 'Nova senha';
      default: return 'Entrar na sua conta';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'login': return 'Bem-vindo de volta!';
      case 'register': return 'Comece a estudar de forma inteligente';
      case 'confirm': return 'Digite o código enviado para seu email';
      case 'forgot-password': return 'Digite seu email para receber o código';
      case 'reset-password': return 'Digite o código e sua nova senha';
      default: return 'Bem-vindo de volta!';
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

            {/* Demo Info - só mostrar na tela de login */}
            {currentView === 'login' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">🚀 Versão Beta</h4>
                <p className="text-sm text-blue-800">
                  Estamos em desenvolvimento! Sua conta será criada com dados de exemplo para você explorar a plataforma.
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Auth Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                {(currentView === 'confirm' || currentView === 'reset-password' || currentView === 'forgot-password') && (
                  <button
                    onClick={() => setCurrentView('login')}
                    className="mr-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {getTitle()}
                </h2>
              </div>
              <p className="text-gray-600">
                {getSubtitle()}
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
              {/* Nome - apenas no registro */}
              {currentView === 'register' && (
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
              )}

              {/* Email - em todas as telas exceto reset-password se já tiver email */}
              {(currentView !== 'reset-password' || !formData.email) && (
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Código de confirmação */}
              {(currentView === 'confirm' || currentView === 'reset-password') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código de confirmação
                  </label>
                  <input
                    type="text"
                    name="confirmationCode"
                    value={formData.confirmationCode}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500 text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
              )}

              {/* Senha */}
              {(currentView === 'login' || currentView === 'register') && (
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
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
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
              )}

              {/* Nova senha */}
              {currentView === 'reset-password' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
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
              )}

              {/* Confirmar senha - apenas no registro */}
              {currentView === 'register' && (
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {currentView === 'login' && 'Entrar'}
                      {currentView === 'register' && 'Criar conta'}
                      {currentView === 'confirm' && 'Confirmar email'}
                      {currentView === 'forgot-password' && 'Enviar código'}
                      {currentView === 'reset-password' && 'Redefinir senha'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Resend Code Button */}
              {currentView === 'confirm' && (
                <button
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full text-indigo-600 hover:text-indigo-500 font-medium py-2 disabled:opacity-50"
                >
                  Reenviar código
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <div className="mt-6 text-center space-y-2">
              {currentView === 'login' && (
                <>
                  <p className="text-gray-600">
                    Não tem uma conta?
                    <button
                      onClick={() => setCurrentView('register')}
                      className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Criar conta gratuita
                    </button>
                  </p>
                  <button
                    onClick={() => setCurrentView('forgot-password')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Esqueceu sua senha?
                  </button>
                </>
              )}
              
              {currentView === 'register' && (
                <p className="text-gray-600">
                  Já tem uma conta?
                  <button
                    onClick={() => setCurrentView('login')}
                    className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Fazer login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;