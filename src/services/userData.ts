import { dynamoDBService } from './dynamodb';

export interface UserStudyPlan {
  id: string;
  userId: string;
  name: string;
  editalText?: string;
  subjects: Array<{
    name: string;
    weight: number;
    difficulty: 'Baixo' | 'Médio' | 'Alto';
    estimatedHours: number;
    topics: string[];
    selected: boolean;
  }>;
  preferences: {
    hoursPerDay: number;
    daysPerWeek: string[];
    priority: string;
    preferredPeriod: string;
    includeRevisions: boolean;
    weeklySimulations: boolean;
  };
  schedule: Array<{
    day: string;
    morning: string;
    afternoon: string;
    evening: string;
  }>;
  progress: {
    totalHours: number;
    completedHours: number;
    percentage: number;
    weeklyGoal: number;
    currentWeekHours: number;
  };
  examInfo?: {
    name: string;
    institution: string;
    examDate?: string;
    totalQuestions?: number;
    salary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  studyPlans: UserStudyPlan[];
  activeStudyPlanId?: string;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    theme: 'light' | 'dark';
  };
  stats: {
    totalStudyHours: number;
    totalDaysStudied: number;
    longestStreak: number;
    currentStreak: number;
    totalPlansCreated: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const userDataService = {
  // Buscar perfil do usuário (ou criar se não existir)
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Primeiro tenta buscar no DynamoDB
      let profile = await dynamoDBService.getUserProfile(userId);
      
      if (!profile) {
        // Se não existe, retorna null (usuário novo)
        return null;
      }

      // Buscar planos de estudo separadamente
      const studyPlans = await dynamoDBService.getUserStudyPlans(userId);
      profile.studyPlans = studyPlans;

      return profile;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  },

  // Inicializar perfil do usuário (primeira vez)
  async initializeUserProfile(userId: string, email: string, name: string): Promise<UserProfile> {
    try {
      return await dynamoDBService.initializeUser(userId, email, name);
    } catch (error) {
      console.error('Erro ao inicializar perfil:', error);
      throw error;
    }
  },

  // Criar novo plano de estudos
  async createStudyPlan(userId: string, planData: Partial<UserStudyPlan>): Promise<UserStudyPlan> {
    try {
      const newPlan: UserStudyPlan = {
        id: 'plan-' + Date.now(),
        userId,
        name: planData.name || 'Novo Plano',
        editalText: planData.editalText,
        subjects: planData.subjects || [],
        preferences: planData.preferences || {
          hoursPerDay: 4,
          daysPerWeek: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
          priority: 'Matérias com maior peso',
          preferredPeriod: 'Distribuído',
          includeRevisions: true,
          weeklySimulations: false
        },
        schedule: planData.schedule || [],
        progress: {
          totalHours: planData.progress?.totalHours || 0,
          completedHours: 0,
          percentage: 0,
          weeklyGoal: 0,
          currentWeekHours: 0
        },
        examInfo: planData.examInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar plano no DynamoDB
      await dynamoDBService.createStudyPlan(newPlan);

      // Atualizar perfil do usuário (definir como plano ativo e incrementar stats)
      await this.setActiveStudyPlan(userId, newPlan.id);
      
      const profile = await dynamoDBService.getUserProfile(userId);
      if (profile) {
        await dynamoDBService.updateUserProfile(userId, {
          stats: {
            ...profile.stats,
            totalPlansCreated: profile.stats.totalPlansCreated + 1
          }
        });
      }

      return newPlan;
    } catch (error) {
      console.error('Erro ao criar plano de estudo:', error);
      throw error;
    }
  },

  // Atualizar plano de estudos existente
  async updateStudyPlan(userId: string, planId: string, updates: Partial<UserStudyPlan>): Promise<UserStudyPlan> {
    try {
      return await dynamoDBService.updateStudyPlan(planId, updates);
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  },

  // Definir plano ativo
  async setActiveStudyPlan(userId: string, planId: string): Promise<void> {
    try {
      await dynamoDBService.updateUserProfile(userId, {
        activeStudyPlanId: planId
      });
    } catch (error) {
      console.error('Erro ao definir plano ativo:', error);
      throw error;
    }
  },

  // Buscar plano ativo
  async getActiveStudyPlan(userId: string): Promise<UserStudyPlan | null> {
    try {
      const profile = await dynamoDBService.getUserProfile(userId);
      if (!profile?.activeStudyPlanId) {
        return null;
      }

      return await dynamoDBService.getStudyPlan(profile.activeStudyPlanId);
    } catch (error) {
      console.error('Erro ao buscar plano ativo:', error);
      return null;
    }
  },

  // Atualizar progresso de estudos
  async updateProgress(userId: string, planId: string, hoursStudied: number): Promise<void> {
    try {
      // Buscar plano atual
      const plan = await dynamoDBService.getStudyPlan(planId);
      if (!plan) throw new Error('Plano não encontrado');

      // Calcular novo progresso
      const newCompletedHours = plan.progress.completedHours + hoursStudied;
      const newCurrentWeekHours = plan.progress.currentWeekHours + hoursStudied;
      const newPercentage = Math.round((newCompletedHours / plan.progress.totalHours) * 100);

      // Atualizar plano
      await dynamoDBService.updateStudyPlan(planId, {
        progress: {
          ...plan.progress,
          completedHours: newCompletedHours,
          currentWeekHours: newCurrentWeekHours,
          percentage: newPercentage
        }
      });

      // Atualizar estatísticas do usuário
      const profile = await dynamoDBService.getUserProfile(userId);
      if (profile) {
        await dynamoDBService.updateUserProfile(userId, {
          stats: {
            ...profile.stats,
            totalStudyHours: profile.stats.totalStudyHours + hoursStudied,
            totalDaysStudied: profile.stats.totalDaysStudied + 1,
            currentStreak: profile.stats.currentStreak + 1,
            longestStreak: Math.max(profile.stats.longestStreak, profile.stats.currentStreak + 1)
          }
        });
      }

      // Salvar progresso detalhado
      await dynamoDBService.saveProgress({
        userId,
        progressId: `${new Date().toISOString().split('T')[0]}#${Date.now()}`,
        planId,
        date: new Date().toISOString().split('T')[0],
        subject: 'Estudo Geral', // Pode ser mais específico depois
        hoursStudied,
        topicsStudied: [],
        completed: true,
        notes: `${hoursStudied}h de estudo`
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      throw error;
    }
  },

  // Deletar plano de estudos
  async deleteStudyPlan(userId: string, planId: string): Promise<void> {
    try {
      // Deletar plano
      await dynamoDBService.deleteStudyPlan(planId);

      // Se era o plano ativo, limpar referência
      const profile = await dynamoDBService.getUserProfile(userId);
      if (profile?.activeStudyPlanId === planId) {
        const remainingPlans = await dynamoDBService.getUserStudyPlans(userId);
        const newActiveId = remainingPlans.length > 0 ? remainingPlans[0].id : undefined;
        
        await dynamoDBService.updateUserProfile(userId, {
          activeStudyPlanId: newActiveId
        });
      }
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      throw error;
    }
  },

  // Atualizar preferências do usuário
  async updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    try {
      const profile = await dynamoDBService.getUserProfile(userId);
      if (!profile) throw new Error('Usuário não encontrado');

      await dynamoDBService.updateUserProfile(userId, {
        preferences: {
          ...profile.preferences,
          ...preferences
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      throw error;
    }
  },

  // Buscar todos os planos do usuário
  async getUserStudyPlans(userId: string): Promise<UserStudyPlan[]> {
    try {
      return await dynamoDBService.getUserStudyPlans(userId);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
  },

  // Salvar resultado da análise de edital
  async saveEditalAnalysis(
    userId: string, 
    editalText: string, 
    analysisResult: any
  ): Promise<UserStudyPlan> {
    const planData: Partial<UserStudyPlan> = {
      name: analysisResult.examInfo?.name || 'Novo Concurso',
      editalText,
      subjects: analysisResult.subjects?.map((subject: any) => ({
        name: subject.name,
        weight: subject.weight || 0,
        difficulty: subject.difficulty || 'Médio',
        estimatedHours: subject.estimatedHours || 20,
        topics: subject.topics || [],
        selected: true
      })) || [],
      examInfo: analysisResult.examInfo,
      progress: {
        totalHours: analysisResult.studyRecommendations?.totalEstimatedHours || 0,
        completedHours: 0,
        percentage: 0,
        weeklyGoal: 0,
        currentWeekHours: 0
      }
    };

    return this.createStudyPlan(userId, planData);
  },

  // Verificar se usuário existe (para uso interno)
  async userExists(userId: string): Promise<boolean> {
    try {
      const profile = await dynamoDBService.getUserProfile(userId);
      return profile !== null;
    } catch (error) {
      return false;
    }
  },

  // Health check do serviço
  async healthCheck(): Promise<boolean> {
    try {
      return await dynamoDBService.healthCheck();
    } catch (error) {
      return false;
    }
  }
};