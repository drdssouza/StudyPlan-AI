// src/services/bedrock.ts
import { apiService, AnalyzeEditalRequest } from './api';

export interface BedrockAnalysisResult {
  success: boolean;
  subjects: Array<{
    name: string;
    weight: number;
    difficulty: 'Baixo' | 'Médio' | 'Alto';
    estimatedHours: number;
    topics: string[];
  }>;
  examInfo?: {
    name: string;
    institution: string;
    totalQuestions: number;
    examDate: string;
    salary: string;
  };
  totalEstimatedHours: number;
  recommendedDuration: number;
  error?: string;
  source?: string;
}

export const bedrockService = {
  async analyzeEdital(editalText: string): Promise<BedrockAnalysisResult> {
    try {
      const request: AnalyzeEditalRequest = {
        editalText,
        preferences: {}
      };

      const response = await apiService.analyzeEdital(request);

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Erro na análise do edital',
          source: response.source || 'api_error',
          subjects: [],
          totalEstimatedHours: 0,
          recommendedDuration: 0
        };
      }

      // Converter formato da API para formato esperado pelo frontend
      const subjects = (response.subjects || []).map(subject => ({
        name: subject.name,
        weight: subject.weight || 0,
        difficulty: subject.difficulty || 'Médio' as const,
        estimatedHours: subject.estimatedHours,
        topics: subject.topics
      }));

      return {
        success: true,
        subjects,
        examInfo: response.examInfo ? {
          name: response.examInfo.name || 'Não especificado',
          institution: response.examInfo.institution || 'Não especificado',
          totalQuestions: response.examInfo.totalQuestions || 0,
          examDate: response.examInfo.examDate || 'Não especificado',
          salary: response.examInfo.salary || 'Não especificado'
        } : undefined,
        totalEstimatedHours: response.studyRecommendations?.totalEstimatedHours || 0,
        recommendedDuration: response.studyRecommendations?.recommendedMonths || 0
      };

    } catch (error) {
      console.error('Erro no bedrockService:', error);
      return {
        success: false,
        error: 'Erro inesperado na análise',
        source: 'service_error',
        subjects: [],
        totalEstimatedHours: 0,
        recommendedDuration: 0
      };
    }
  },

  async generateStudyPlan(subjects: string[], hoursPerDay: number, preferences: any): Promise<any> {
    // Placeholder - implementar depois
    return {
      success: true,
      schedule: [],
      milestones: []
    };
  }
};