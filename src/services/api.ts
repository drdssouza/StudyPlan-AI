// src/services/api.ts - Completo com polling
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

  // Analisar edital (via S3 + Step Function)
  async analyzeEdital(file: File): Promise<AnalyzeEditalResponse> {
    try {
      console.log('=== INÍCIO ANÁLISE EDITAL VIA S3 ===');
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Arquivo:', { name: file.name, size: file.size, type: file.type });
      
      if (!API_BASE_URL) {
        console.error('❌ API_BASE_URL não configurada');
        return {
          success: false,
          error: 'API não configurada. Verifique as variáveis de ambiente.',
          suggestion: 'Configure NEXT_PUBLIC_API_BASE_URL no .env.local'
        };
      }

      // Verificar tamanho do arquivo
      if (file.size > 10 * 1024 * 1024) { // 10MB
        console.warn('⚠️ Arquivo muito grande:', file.size);
        return {
          success: false,
          error: 'PDF muito grande. Limite: 10MB.',
          suggestion: 'Tente um PDF menor ou com menos páginas.'
        };
      }

      console.log('🔄 Step 1: Obtendo URL assinada para upload...');
      
      // 1. Obter URL assinada para upload no S3
      const uploadUrlResponse = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        }),
      });

      if (!uploadUrlResponse.ok) {
        const errorText = await uploadUrlResponse.text();
        console.error('❌ Erro ao obter URL de upload:', uploadUrlResponse.status, errorText);
        throw new Error(`Erro ao obter URL de upload: ${uploadUrlResponse.status} - ${errorText}`);
      }

      const uploadData = await uploadUrlResponse.json();
      console.log('✅ Resposta completa do /upload:', uploadData);
      
      // Verificar se a resposta vem no formato Lambda (com statusCode e body)
      let parsedUploadData;
      if (uploadData.statusCode && uploadData.body) {
        console.log('🔄 Detectada resposta no formato Lambda, fazendo parse do body...');
        parsedUploadData = JSON.parse(uploadData.body);
      } else {
        console.log('🔄 Resposta direta, usando dados como estão...');
        parsedUploadData = uploadData;
      }
      
      console.log('📋 Dados finais processados:', parsedUploadData);
      
      // Verificar se todos os campos necessários existem
      if (!parsedUploadData.uploadUrl) {
        console.error('❌ uploadUrl não encontrada na resposta:', parsedUploadData);
        throw new Error('API não retornou uploadUrl válida');
      }
      
      if (!parsedUploadData.fileKey) {
        console.error('❌ fileKey não encontrada na resposta:', parsedUploadData);
        throw new Error('API não retornou fileKey válida');
      }
      
      console.log('✅ URL de upload obtida:', {
        fileKey: parsedUploadData.fileKey,
        bucketName: parsedUploadData.bucketName,
        uploadUrl: parsedUploadData.uploadUrl ? 'OK' : 'MISSING'
      });

      console.log('📤 Step 2: Fazendo upload do PDF para S3...');
      console.log('Upload URL:', uploadData.uploadUrl);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
      
      // 2. Upload do arquivo para S3
      const uploadResponse = await fetch(parsedUploadData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      console.log('📊 Upload response status:', uploadResponse.status, uploadResponse.statusText);
      console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Erro no upload:', uploadResponse.status, errorText);
        throw new Error(`Erro no upload: ${uploadResponse.status} - ${errorText}`);
      }

      console.log('✅ Upload concluído para S3');

      console.log('🚀 Step 3: Iniciando análise via Step Function...');
      console.log('Dados para análise:', {
        fileKey: parsedUploadData.fileKey,
        fileName: file.name,
        url: `${API_BASE_URL}/analyze`
      });
      
      // 3. Iniciar análise via Step Function com fileKey
      const analyzeResponse = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fileKey: parsedUploadData.fileKey,
          fileName: file.name,
          preferences: {}
        }),
      });

      console.log('📊 Analyze response status:', analyzeResponse.status, analyzeResponse.statusText);
      console.log('📊 Analyze response headers:', Object.fromEntries(analyzeResponse.headers.entries()));

      if (!analyzeResponse.ok) {
        const errorText = await analyzeResponse.text();
        console.error('❌ Erro ao iniciar análise:', analyzeResponse.status, errorText);
        
        return {
          success: false,
          error: `Erro HTTP ${analyzeResponse.status}: ${analyzeResponse.statusText}`,
          suggestion: 'Verifique se a API está funcionando corretamente',
          details: errorText
        };
      }

      const responseText = await analyzeResponse.text();
      console.log('📦 Analyze response body:', responseText.substring(0, 500), '...');

      try {
        // Parse da resposta da Step Function
        const stepFunctionResponse = JSON.parse(responseText);
        
        // Verificar se é resposta da Step Function (tem body string)
        if (stepFunctionResponse.body && typeof stepFunctionResponse.body === 'string') {
          const jobResponse = JSON.parse(stepFunctionResponse.body);
          
          if (jobResponse.success && jobResponse.jobId) {
            console.log('🚀 Job iniciado:', jobResponse.jobId);
            console.log('⏳ Fazendo polling do resultado...');
            
            // Fazer polling do resultado
            return await this.pollJobResult(jobResponse.jobId, jobResponse.poolingUrl);
          } else {
            throw new Error('Resposta inválida da Step Function');
          }
        } else {
          // Resposta direta (não Step Function)
          console.log('✅ Resposta direta recebida');
          return stepFunctionResponse;
        }
        
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        return {
          success: false,
          error: 'Resposta inválida da API',
          suggestion: 'A API retornou uma resposta que não é JSON válido',
          rawResponse: responseText.substring(0, 200)
        };
      }
      
    } catch (error) {
      console.error('❌ Erro na requisição:', error);
      
      let errorMessage = 'Erro ao conectar com o servidor';
      let suggestion = 'Verifique sua conexão e tente novamente';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Erro de rede ou CORS';
        suggestion = 'Verifique se a API está acessível e CORS está configurado';
      }
      
      return {
        success: false,
        error: errorMessage,
        suggestion,
        details: error.message
      };
    }
  },

  // Função para fazer polling do resultado do job
  async pollJobResult(jobId: string, poolingUrl?: string): Promise<AnalyzeEditalResponse> {
    const maxAttempts = 30; // 5 minutos (30 * 10s)
    const pollInterval = 10000; // 10 segundos
    
    console.log(`🔄 Iniciando polling para job ${jobId}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`📡 Tentativa ${attempt}/${maxAttempts} - Verificando resultado...`);
        
        // OPÇÃO 1: Tentar via API Gateway (mais seguro)
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/job-status/${jobId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (statusResponse.ok) {
            const result = await statusResponse.json();
            
            if (result.status === 'SUCCESS' || result.success) {
              console.log('✅ Job concluído com sucesso via API!');
              return result;
            } else if (result.status === 'FAILED') {
              console.error('❌ Job falhou:', result.error);
              return {
                success: false,
                error: result.error || 'Job falhou na execução',
                suggestion: 'Tente novamente com um PDF diferente'
              };
            } else {
              console.log(`⏳ Job ainda executando via API... (status: ${result.status || 'RUNNING'})`);
            }
          } else if (statusResponse.status === 404) {
            console.log(`⏳ Status ainda não disponível via API (tentativa ${attempt})`);
          }
        } catch (apiError) {
          console.log(`⚠️ API indisponível, tentando S3 direto...`);
          
          // OPÇÃO 2: Fallback para S3 direto (pode dar CORS)
          const resultUrl = poolingUrl || `https://studyplan-ai-jobs.s3.amazonaws.com/jobs/${jobId}/result.json`;
          
          const response = await fetch(resultUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.status === 'SUCCESS' || result.success) {
              console.log('✅ Job concluído com sucesso via S3!');
              return result;
            } else if (result.status === 'FAILED') {
              console.error('❌ Job falhou:', result.error);
              return {
                success: false,
                error: result.error || 'Job falhou na execução',
                suggestion: 'Tente novamente com um PDF diferente'
              };
            } else {
              console.log(`⏳ Job ainda executando via S3... (status: ${result.status || 'RUNNING'})`);
            }
          } else if (response.status === 404) {
            console.log(`⏳ Resultado ainda não disponível via S3 (tentativa ${attempt})`);
          } else {
            console.warn(`⚠️ Erro ao buscar resultado via S3: ${response.status}`);
          }
        }
        
        // Aguardar antes da próxima tentativa
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
      } catch (error) {
        console.warn(`⚠️ Erro no polling (tentativa ${attempt}):`, error);
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
    }
    
    // Timeout
    console.error('❌ Timeout: Job não concluído no tempo esperado');
    return {
      success: false,
      error: 'Timeout: Análise demorou mais que o esperado',
      suggestion: 'O PDF pode ser muito complexo. Tente um arquivo menor ou tente novamente.'
    };
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