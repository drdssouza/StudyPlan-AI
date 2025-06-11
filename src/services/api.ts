// src/services/api.ts - Simplificado para API Gateway existente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export interface JobResult {
  success: boolean;
  jobId?: string;
  status?: 'RUNNING' | 'SUCCESS' | 'FAILED';
  estimatedDuration?: string;
  error?: string;
}

export interface AnalyzeEditalRequest {
  jobType: 'analyze_edital';
  fileKey: string; // Chave do arquivo no S3
  fileName: string;
  preferences?: {
    priority?: string;
    focusAreas?: string[];
  };
}

export interface GenerateStudyPlanRequest {
  userId: string;
  subjects: any[];
  preferences: any;
  topicConfigurations: Record<string, any>;
  examInfo?: any;
}

export interface AnalyzeEditalResponse {
  success: boolean;
  jobId?: string;
  subjects?: Array<{
    name: string;
    weight: number | null;
    difficulty: 'Baixo' | 'Médio' | 'Alto' | null;
    estimatedHours: number;
    topics: Array<{
      name: string;
      description: string;
      difficulty: 'Baixo' | 'Médio' | 'Alto';
      estimatedHours: number;
      studyMethods: string[];
      isOptional: boolean;
    }>;
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
  studyRecommendations?: {
    analysisConfidence: 'Alta' | 'Média' | 'Baixa';
    totalEstimatedHours: number;
    recommendedMonths: number;
    subjectsFound: number;
  };
  error?: string;
  suggestion?: string;
}

export const apiService = {
  // Converter PDF para base64
  async pdfToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remover o prefixo "data:application/pdf;base64,"
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Analisar edital (Direto na Lambda - sem Step Function)
  async analyzeEdital(file: File): Promise<AnalyzeEditalResponse> {
    try {
      console.log('Convertendo PDF para base64...');
      const fileContent = await this.pdfToBase64(file);
      
      // Verificar tamanho (limite prático: ~1MB base64)
      if (fileContent.length > 1000000) {
        return {
          success: false,
          error: 'PDF muito grande. Limite: 1MB.',
          suggestion: 'Tente um PDF menor ou com menos páginas.'
        };
      }
      
      const requestData = {
        fileContent,
        fileName: file.name,
        preferences: {}

      };

      console.log('Enviando para análise direta:', {
        fileName: file.name,
        fileSize: file.size,
        contentLength: fileContent.length
      });
      
      // Usar endpoint direto (sem Step Function)
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Resultado da análise:', result);
      
      return result;
    } catch (error) {
      console.error('Erro ao analisar edital:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor'
      };
    }
  },

  // Gerar plano de estudos (Step Function)
  async generateStudyPlan(data: GenerateStudyPlanRequest): Promise<JobResult> {
    try {
      console.log('Gerando plano de estudos:', data);
      
      const response = await fetch(`${API_BASE_URL}/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      return {
        success: false,
        error: 'Erro ao conectar com o servidor'
      };
    }
  }
};