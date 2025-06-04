import { Amplify } from 'aws-amplify';
import { 
  signIn, 
  signUp, 
  confirmSignUp, 
  signOut, 
  getCurrentUser,
  fetchUserAttributes,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword
} from 'aws-amplify/auth';

// Configuração do Amplify sem Client Secret
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || '',
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        username: false
      }
    }
  }
};

// Configurar Amplify apenas no cliente
if (typeof window !== 'undefined') {
  Amplify.configure(amplifyConfig);
}

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresConfirmation?: boolean;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signIn({
        username: email,
        password: password
      });

      if (result.isSignedIn) {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        
        return {
          success: true,
          user: {
            id: user.userId,
            email: attributes.email,
            name: attributes.name || attributes.email,
            attributes: attributes
          }
        };
      } else {
        return {
          success: false,
          error: 'Login não completado'
        };
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      let errorMessage = 'Erro ao fazer login';
      
      switch (error.name) {
        case 'NotAuthorizedException':
          errorMessage = 'Email ou senha incorretos';
          break;
        case 'UserNotConfirmedException':
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
          // Redirecionar para confirmação se necessário
          break;
        case 'PasswordResetRequiredException':
          errorMessage = 'É necessário redefinir sua senha';
          break;
        case 'UserNotFoundException':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'TooManyRequestsException':
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
          break;
        default:
          errorMessage = error.message || 'Erro inesperado no login';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async signUp(email: string, password: string, name: string): Promise<AuthResult> {
    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            name: name
          }
        }
      });

      return {
        success: true,
        requiresConfirmation: !result.isSignUpComplete,
        user: {
          email: email,
          name: name
        }
      };
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      let errorMessage = 'Erro ao criar conta';
      
      switch (error.name) {
        case 'UsernameExistsException':
          errorMessage = 'Email já está em uso';
          break;
        case 'InvalidPasswordException':
          errorMessage = 'Senha deve ter pelo menos 8 caracteres com maiúscula, minúscula e número';
          break;
        case 'InvalidParameterException':
          errorMessage = 'Email inválido';
          break;
        case 'TooManyRequestsException':
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
          break;
        default:
          errorMessage = error.message || 'Erro inesperado no cadastro';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async confirmSignUp(email: string, code: string): Promise<AuthResult> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Erro na confirmação:', error);
      
      let errorMessage = 'Erro ao confirmar email';
      
      switch (error.name) {
        case 'CodeMismatchException':
          errorMessage = 'Código inválido';
          break;
        case 'ExpiredCodeException':
          errorMessage = 'Código expirado. Solicite um novo código.';
          break;
        case 'UserNotFoundException':
          errorMessage = 'Usuário não encontrado';
          break;
        default:
          errorMessage = error.message || 'Erro inesperado na confirmação';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async resendConfirmationCode(email: string): Promise<AuthResult> {
    try {
      await resendSignUpCode({
        username: email
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Erro ao reenviar código:', error);
      
      return {
        success: false,
        error: error.message || 'Erro ao reenviar código'
      };
    }
  },

  async signOut(): Promise<AuthResult> {
    try {
      await signOut();
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Erro no logout:', error);
      return {
        success: false,
        error: error.message || 'Erro ao fazer logout'
      };
    }
  },

  async getCurrentUser(): Promise<AuthResult> {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();
      
      return {
        success: true,
        user: {
          id: user.userId,
          email: attributes.email,
          name: attributes.name || attributes.email,
          attributes: attributes
        }
      };
    } catch (error: any) {
      console.error('Erro ao verificar usuário:', error);
      return {
        success: false,
        error: 'Usuário não logado'
      };
    }
  },

  async forgotPassword(email: string): Promise<AuthResult> {
    try {
      await resetPassword({
        username: email
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Erro ao solicitar reset:', error);
      
      let errorMessage = 'Erro ao solicitar redefinição de senha';
      
      switch (error.name) {
        case 'UserNotFoundException':
          errorMessage = 'Email não encontrado';
          break;
        case 'TooManyRequestsException':
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos.';
          break;
        default:
          errorMessage = error.message || 'Erro inesperado';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<AuthResult> {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword: newPassword
      });

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Erro ao confirmar nova senha:', error);
      
      let errorMessage = 'Erro ao redefinir senha';
      
      switch (error.name) {
        case 'CodeMismatchException':
          errorMessage = 'Código inválido';
          break;
        case 'ExpiredCodeException':
          errorMessage = 'Código expirado. Solicite um novo código.';
          break;
        case 'InvalidPasswordException':
          errorMessage = 'Senha deve ter pelo menos 8 caracteres com maiúscula, minúscula e número';
          break;
        default:
          errorMessage = error.message || 'Erro inesperado';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
};