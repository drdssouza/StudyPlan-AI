// src/services/api.ts
const API_BASE_URL = 'https://rvtyu6hh0c.execute-api.us-east-1.amazonaws.com/prod';

export interface AnalyzeEditalRequest {
  editalText: string;
  preferences?: {
    priority?: string;
    focusAreas?: string[];
  };
}

export interface AnalyzeEditalResponse {
  success: boolean;
  subjects?: Array<{
    name: string;
    weight: number | null;
    difficulty: 'Baixo' | 'Médio' | 'Alto' | null;
    estimatedHours: number;
    topics: string[];
    isOptional: boolean | null;
    questionsCount: number | null;
    points: number | null;
  }>;
  examInfo?: {
    name: string | null;
    institution: string | null;
    totalQuestions: number | null;
    examDate: string | null;
    phases: string[];
    salary: string | null;
    vacancies: number | null;
  };
  requirements?: {
    education: string | null;
    experience: string | null;
    age: string | null;
    other: string[];
  };
  studyRecommendations?: {
    analysisConfidence: 'Alta' | 'Média' | 'Baixa';
    totalEstimatedHours: number;
    recommendedMonths: number;
    subjectsFound: number;
  };
  error?: string;
  source?: string;
  suggestion?: string;
}

export const apiService = {
  async analyzeEdital(data: AnalyzeEditalRequest): Promise<AnalyzeEditalResponse> {
    try {
      console.log('Enviando para API:', API_BASE_URL + '/analyze');
      
      const response = await fetch(API_BASE_URL + '/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resposta da API:', result);
      
      return result;
    } catch (error) {
      console.error('Erro ao chamar API:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor',
        source: 'network_error'
      };
    }
  }
};