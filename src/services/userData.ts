// src/services/userData.ts - Usando localStorage
export interface UserStudyPlan {
  id: string;
  userId: string;
  name: string;
  subjects: Array<{
    name: string;
    weight: number;
    difficulty: 'Baixo' | 'Médio' | 'Alto';
    estimatedHours: number;
    topics: Array<{
      name: string;
      description: string;
      difficulty: 'Baixo' | 'Médio' | 'Alto';
      estimatedHours: number;
      userDifficulty?: 'Muito Fácil' | 'Fácil' | 'Normal' | 'Difícil' | 'Muito Difícil';
      userNotes?: string;
      studyMethods: string[];
    }>;
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

const STORAGE_KEYS = {
  USER_PROFILE: 'studyplan_user_profile',
  STUDY_PLANS: 'studyplan_study_plans'
};

export const userDataService = {
  // Buscar perfil do usuário do localStorage
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      if (typeof window === 'undefined') return null;
      
      const stored = localStorage.getItem(`${STORAGE_KEYS.USER_PROFILE}_${userId}`);
      if (!stored) return null;
      
      const profile = JSON.parse(stored);
      
      // Buscar planos de estudo
      const plans = await this.getUserStudyPlans(userId);
      profile.studyPlans = plans;
      
      return profile;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  },

  // Inicializar perfil do usuário (primeira vez)
  async initializeUserProfile(userId: string, email: string, name: string): Promise<UserProfile> {
    const newProfile: UserProfile = {
      userId,
      email,
      name,
      studyPlans: [],
      preferences: {
        notifications: true,
        emailUpdates: true,
        theme: 'light'
      },
      stats: {
        totalStudyHours: 0,
        totalDaysStudied: 0,
        longestStreak: 0,
        currentStreak: 0,
        totalPlansCreated: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEYS.USER_PROFILE}_${userId}`, JSON.stringify(newProfile));
      }
      return newProfile;
    } catch (error) {
      console.error('Erro ao inicializar perfil:', error);
      throw error;
    }
  },

  // Criar novo plano de estudos
  async createStudyPlan(userId: string, planData: Partial<UserStudyPlan>): Promise<UserStudyPlan> {
    const newPlan: UserStudyPlan = {
      id: 'plan-' + Date.now(),
      userId,
      name: planData.name || 'Novo Plano',
      subjects: planData.subjects || [],
      preferences: planData.preferences || {
        hoursPerDay: 4,
        daysPerWeek: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
        priority: 'Matérias com maior peso',
        preferredPeriod: 'Distribuído',
        includeRevisions: true,
        weeklySimulations: false
      },
      schedule: planData.schedule || this.generateBasicSchedule(planData.subjects || [], 4),
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

    try {
      if (typeof window !== 'undefined') {
        // Salvar plano individual
        const plans = await this.getUserStudyPlans(userId);
        plans.push(newPlan);
        localStorage.setItem(`${STORAGE_KEYS.STUDY_PLANS}_${userId}`, JSON.stringify(plans));
        
        // Definir como plano ativo
        await this.setActiveStudyPlan(userId, newPlan.id);
        
        // Atualizar stats do usuário
        const profile = await this.getUserProfile(userId);
        if (profile) {
          profile.stats.totalPlansCreated += 1;
          profile.updatedAt = new Date().toISOString();
          localStorage.setItem(`${STORAGE_KEYS.USER_PROFILE}_${userId}`, JSON.stringify(profile));
        }
      }

      return newPlan;
    } catch (error) {
      console.error('Erro ao criar plano de estudo:', error);
      throw error;
    }
  },

  // Gerar cronograma básico
  generateBasicSchedule(subjects: any[], hoursPerDay: number): Array<{day: string, morning: string, afternoon: string, evening: string}> {
    const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const schedule = [];
    
    for (let i = 0; i < days.length; i++) {
      const subjectIndex = i % (subjects.length || 1);
      const subject = subjects[subjectIndex]?.name || 'Estudo Geral';
      
      schedule.push({
        day: days[i],
        morning: `${subject} - Teoria (${Math.floor(hoursPerDay/3)}h)`,
        afternoon: `${subject} - Exercícios (${Math.floor(hoursPerDay/3)}h)`,
        evening: `Revisão Geral (${hoursPerDay - 2*Math.floor(hoursPerDay/3)}h)`
      });
    }
    
    return schedule;
  },

  // Atualizar plano de estudos existente
  async updateStudyPlan(userId: string, planId: string, updates: Partial<UserStudyPlan>): Promise<UserStudyPlan> {
    try {
      if (typeof window !== 'undefined') {
        const plans = await this.getUserStudyPlans(userId);
        const planIndex = plans.findIndex(plan => plan.id === planId);
        
        if (planIndex === -1) {
          throw new Error('Plano não encontrado');
        }
        
        const updatedPlan = {
          ...plans[planIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        plans[planIndex] = updatedPlan;
        localStorage.setItem(`${STORAGE_KEYS.STUDY_PLANS}_${userId}`, JSON.stringify(plans));
        
        return updatedPlan;
      }
      throw new Error('localStorage não disponível');
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      throw error;
    }
  },

  // Definir plano ativo
  async setActiveStudyPlan(userId: string, planId: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const profile = await this.getUserProfile(userId);
        if (profile) {
          profile.activeStudyPlanId = planId;
          profile.updatedAt = new Date().toISOString();
          localStorage.setItem(`${STORAGE_KEYS.USER_PROFILE}_${userId}`, JSON.stringify(profile));
        }
      }
    } catch (error) {
      console.error('Erro ao definir plano ativo:', error);
      throw error;
    }
  },

  // Buscar plano ativo
  async getActiveStudyPlan(userId: string): Promise<UserStudyPlan | null> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile?.activeStudyPlanId) {
        return null;
      }

      const plans = await this.getUserStudyPlans(userId);
      const activePlan = plans.find(plan => plan.id === profile.activeStudyPlanId);
      return activePlan || null;
    } catch (error) {
      console.error('Erro ao buscar plano ativo:', error);
      return null;
    }
  },

  // Buscar todos os planos do usuário
  async getUserStudyPlans(userId: string): Promise<UserStudyPlan[]> {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(`${STORAGE_KEYS.STUDY_PLANS}_${userId}`);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return [];
    }
  },

  // Deletar plano de estudos
  async deleteStudyPlan(userId: string, planId: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const plans = await this.getUserStudyPlans(userId);
        const filteredPlans = plans.filter(plan => plan.id !== planId);
        localStorage.setItem(`${STORAGE_KEYS.STUDY_PLANS}_${userId}`, JSON.stringify(filteredPlans));
        
        // Se era o plano ativo, limpar referência
        const profile = await this.getUserProfile(userId);
        if (profile?.activeStudyPlanId === planId) {
          const newActiveId = filteredPlans.length > 0 ? filteredPlans[0].id : undefined;
          if (newActiveId) {
            await this.setActiveStudyPlan(userId, newActiveId);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao deletar plano:', error);
      throw error;
    }
  },

  // Verificar se usuário existe
  async userExists(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile !== null;
    } catch (error) {
      return false;
    }
  },

  // Salvar resultado da análise de edital
  async saveEditalAnalysis(
    userId: string,
    fileName: string,
    analysisResult: any
  ): Promise<UserStudyPlan> {
    const planData: Partial<UserStudyPlan> = {
      name: analysisResult.examInfo?.name || fileName.replace('.pdf', ''),
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
  }
};