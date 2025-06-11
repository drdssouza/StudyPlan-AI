// src/types/index.ts

// Re-export dos tipos globais
export * from './global';

// Tipos específicos da aplicação
export interface User {
  id: string;
  email: string;
  name: string;
  attributes?: {
    email_verified?: boolean;
    name?: string;
  };
}

export interface Subject {
  name: string;
  weight: number;
  difficulty: 'Baixo' | 'Médio' | 'Alto';
  estimatedHours: number;
  topics: Topic[];
  selected?: boolean;
}

export interface Topic {
  name: string;
  description: string;
  difficulty: 'Baixo' | 'Médio' | 'Alto';
  estimatedHours: number;
  isOptional: boolean;
  studyMethods: string[];
  userDifficulty?: 'Muito Fácil' | 'Fácil' | 'Normal' | 'Difícil' | 'Muito Difícil';
  userNotes?: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  subjects: Subject[];
  hoursPerDay: number;
  daysPerWeek: number[];
  startDate: Date;
  endDate: Date;
  progress: number;
}

export interface ScheduleItem {
  day: string;
  morning: string;
  afternoon: string;
  evening: string;
}

export interface ExamInfo {
  name: string;
  institution: string;
  totalQuestions: number;
  examDate: string;
  salary: string;
  vacancies?: number;
}

export interface AnalysisResult {
  success: boolean;
  subjects?: Subject[];
  examInfo?: ExamInfo;
  studyRecommendations?: {
    totalEstimatedHours: number;
    recommendedMonths: number;
    analysisConfidence: 'Alta' | 'Média' | 'Baixa';
  };
  error?: string;
  suggestion?: string;
}

export interface UserPreferences {
  hoursPerDay: number;
  daysPerWeek: string[];
  priority: string;
  preferredPeriod: string;
  includeRevisions: boolean;
  weeklySimulations: boolean;
}

export interface ProgressData {
  totalHours: number;
  completedHours: number;
  percentage: number;
  weeklyGoal: number;
  currentWeekHours: number;
}

// Tipos para upload de arquivos
export interface FileUploadResult {
  success: boolean;
  fileKey?: string;
  uploadUrl?: string;
  error?: string;
}