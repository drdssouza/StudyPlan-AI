// src/services/auth.ts - Versão temporária sem AWS
export interface AuthResult {
    success: boolean;
    user?: any;
    error?: string;
  }
  
  // Simulação de usuários para desenvolvimento
  const mockUsers = [
    { id: '1', email: 'teste@email.com', name: 'Usuário Teste', password: '123456' },
    { id: '2', email: 'admin@studyplan.com', name: 'Admin', password: 'admin123' }
  ];
  
  // Simulação de usuário logado (localStorage)
  let currentUser: any = null;
  
  export const authService = {
    async signIn(email: string, password: string): Promise<AuthResult> {
      try {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se usuário existe
        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          currentUser = { id: user.id, email: user.email, name: user.name };
          // Salvar no localStorage para persistência
          if (typeof window !== 'undefined') {
            localStorage.setItem('studyplan_user', JSON.stringify(currentUser));
          }
          return { success: true, user: currentUser };
        } else {
          return { success: false, error: 'Email ou senha incorretos' };
        }
      } catch (error) {
        return { success: false, error: 'Erro ao fazer login' };
      }
    },
  
    async signUp(email: string, password: string, name: string): Promise<AuthResult> {
      try {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verificar se email já existe
        const existingUser = mockUsers.find(u => u.email === email);
        if (existingUser) {
          return { success: false, error: 'Email já está em uso' };
        }
        
        // Simular criação de conta
        const newUser = {
          id: Date.now().toString(),
          email,
          name,
          password
        };
        
        mockUsers.push(newUser);
        
        return { success: true, user: { id: newUser.id, email: newUser.email, name: newUser.name } };
      } catch (error) {
        return { success: false, error: 'Erro ao criar conta' };
      }
    },
  
    async confirmSignUp(email: string, code: string): Promise<AuthResult> {
      try {
        // Simular confirmação
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Código inválido' };
      }
    },
  
    async signOut(): Promise<AuthResult> {
      try {
        currentUser = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('studyplan_user');
        }
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Erro ao fazer logout' };
      }
    },
  
    async getCurrentUser(): Promise<AuthResult> {
      try {
        // Verificar se há usuário no localStorage
        if (typeof window !== 'undefined') {
          const savedUser = localStorage.getItem('studyplan_user');
          if (savedUser) {
            currentUser = JSON.parse(savedUser);
            return { success: true, user: currentUser };
          }
        }
        
        if (currentUser) {
          return { success: true, user: currentUser };
        }
        
        return { success: false, error: 'Usuário não logado' };
      } catch (error) {
        return { success: false, error: 'Erro ao verificar usuário' };
      }
    },
  
    async signInWithGoogle(): Promise<AuthResult> {
      try {
        // Simular login com Google
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const googleUser = {
          id: 'google_' + Date.now(),
          email: 'google@user.com',
          name: 'Usuário Google'
        };
        
        currentUser = googleUser;
        if (typeof window !== 'undefined') {
          localStorage.setItem('studyplan_user', JSON.stringify(currentUser));
        }
        
        return { success: true, user: currentUser };
      } catch (error) {
        return { success: false, error: 'Erro ao conectar com Google' };
      }
    },
  
    async forgotPassword(email: string): Promise<AuthResult> {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Erro ao enviar código' };
      }
    },
  
    async forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<AuthResult> {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Erro ao redefinir senha' };
      }
    }
  };