'use client';
import { useEffect, useState } from 'react';
import LoginPage from '@/components/auth/LoginPage';
import StudyPlannerApp from '@/components/dashboard/StudyPlannerApp';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { authService } from '@/services/auth';
import { User } from '@/types';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success) {
        setUser(result.user);
      }
    } catch (error) {
      console.log('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    checkAuthStatus();
  };

  const handleLogout = () => {
    setUser(null);
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

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <StudyPlannerApp user={user} onLogout={handleLogout} />;
}