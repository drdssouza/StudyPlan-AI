'use client';
import { useEffect, useState } from 'react';
import HomePage from '@/components/HomePage';
import LoginPage from '@/components/auth/LoginPage';
import StudyPlannerApp from '@/components/dashboard/StudyPlannerApp';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { authService } from '@/services/auth';
import { User } from '@/types';

type AppView = 'home' | 'login' | 'dashboard';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('home');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success) {
        setUser(result.user);
        setCurrentView('dashboard');
      } else {
        setCurrentView('home');
      }
    } catch (error) {
      console.log('Erro ao verificar usuário:', error);
      setCurrentView('home');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    setCurrentView('login');
  };

  const handleLogin = () => {
    checkAuthStatus();
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Renderizar baseado no estado atual
  switch (currentView) {
    case 'home':
      return <HomePage onNavigateToLogin={handleNavigateToLogin} />;
    
    case 'login':
      return <LoginPage onLogin={handleLogin} />;
    
    case 'dashboard':
      if (!user) {
        setCurrentView('home');
        return null;
      }
      return <StudyPlannerApp user={user} onLogout={handleLogout} />;
    
    default:
      return <HomePage onNavigateToLogin={handleNavigateToLogin} />;
  }
}