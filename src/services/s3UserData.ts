// src/services/s3UserData.ts
export interface UserStudyPlan {
    id: string;
    userId: string;
    name: string;
    editalFileKey?: string;
    editalFileName?: string;
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
  
  export const s3UserDataService = {
    // Buscar perfil do usuário do S3
    async getUserProfile(userId: string): Promise<UserProfile | null> {
      try {
        const response = await fetch(`/api/s3/user-data/${userId}/profile`);
        
        if (response.status === 404) {
          return null; // Usuário novo
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const profile = await response.json();
        return profile;
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return null;
      }
    },
  
    // Criar perfil inicial do usuário
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
        const response = await fetch(`/api/s3/user-data/${userId}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newProfile),
        });
  
        if (!response.ok) {
          throw new Error('Erro ao criar perfil');
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
        editalFileKey: planData.editalFileKey,
        editalFileName: planData.editalFileName,
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
  
      try {
        const response = await fetch(`/api/s3/user-data/${userId}/study-plans`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPlan),
        });
  
        if (!response.ok) {
          throw new Error('Erro ao criar plano');
        }
  
        return newPlan;
      } catch (error) {
        console.error('Erro ao criar plano de estudo:', error);
        throw error;
      }
    },
  
    // Atualizar plano de estudos
    async updateStudyPlan(userId: string, planId: string, updates: Partial<UserStudyPlan>): Promise<UserStudyPlan> {
      try {
        const response = await fetch(`/api/s3/user-data/${userId}/study-plans/${planId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });
  
        if (!response.ok) {
          throw new Error('Erro ao atualizar plano');
        }
  
        const updatedPlan = await response.json();
        return updatedPlan;
      } catch (error) {
        console.error('Erro ao atualizar plano:', error);
        throw error;
      }
    },
  
    // Definir plano ativo
    async setActiveStudyPlan(userId: string, planId: string): Promise<void> {
      try {
        const response = await fetch(`/api/s3/user-data/${userId}/active-plan`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activeStudyPlanId: planId }),
        });
  
        if (!response.ok) {
          throw new Error('Erro ao definir plano ativo');
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
  
        const activePlan = profile.studyPlans.find(plan => plan.id === profile.activeStudyPlanId);
        return activePlan || null;
      } catch (error) {
        console.error('Erro ao buscar plano ativo:', error);
        return null;
      }
    },
  
    // Salvar resultado da análise de edital
    async saveEditalAnalysis(
      userId: string,
      fileKey: string,
      fileName: string,
      analysisResult: any
    ): Promise<UserStudyPlan> {
      const planData: Partial<UserStudyPlan> = {
        name: analysisResult.examInfo?.name || fileName.replace('.pdf', ''),
        editalFileKey: fileKey,
        editalFileName: fileName,
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
  
    // Verificar se usuário existe
    async userExists(userId: string): Promise<boolean> {
      try {
        const profile = await this.getUserProfile(userId);
        return profile !== null;
      } catch (error) {
        return false;
      }
    }
  };