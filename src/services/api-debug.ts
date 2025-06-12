const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

console.log('=== DEBUG API CONFIG ===');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
});

export const debugApiService = {
  // Função para testar conectividade com a API
  async testConnectivity(): Promise<boolean> {
    try {
      console.log('🔍 Testando conectividade com API...');
      
      if (!API_BASE_URL) {
        console.error('❌ API_BASE_URL não configurada');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.text();
        console.log('✅ API conectada:', data);
        return true;
      } else {
        console.error('❌ API retornou erro:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao conectar com API:', error);
      return false;
    }
  },

  // Função para testar análise direta (sem arquivo)
  async testAnalyzeEndpoint(): Promise<any> {
    try {
      console.log('🔍 Testando endpoint /analyze...');
      
      const testData = {
        fileContent: 'VGVzdGUgZGUgUERG', // "Teste de PDF" em base64
        fileName: 'teste.pdf',
        preferences: {}
      };

      console.log('📤 Enviando dados de teste:', {
        fileName: testData.fileName,
        contentLength: testData.fileContent.length
      });

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.text();
      console.log('📦 Response body (raw):', result);

      try {
        const jsonResult = JSON.parse(result);
        console.log('📦 Response body (parsed):', jsonResult);
        return jsonResult;
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        return { success: false, error: 'Resposta não é JSON válido', rawResponse: result };
      }

    } catch (error) {
      console.error('❌ Erro no teste do endpoint:', error);
      return { success: false, error: error.message };
    }
  },

  // Função para converter arquivo para base64 e testar
  async testFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('🔍 Convertendo arquivo para base64...');
      console.log('📄 Arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Content = base64.split(',')[1]; // Remove prefix
        
        console.log('✅ Conversão concluída:', {
          originalSize: file.size,
          base64Size: base64Content.length,
          sizeRatio: (base64Content.length / file.size).toFixed(2)
        });
        
        resolve(base64Content);
      };
      
      reader.onerror = () => {
        console.error('❌ Erro ao converter arquivo');
        reject(new Error('Erro ao converter arquivo para base64'));
      };
      
      reader.readAsDataURL(file);
    });
  },

  // Função para testar análise completa com arquivo real
  async testCompleteAnalysis(file: File): Promise<any> {
    try {
      console.log('🚀 Iniciando teste completo de análise...');
      
      // 1. Converter arquivo
      const fileContent = await this.testFileToBase64(file);
      
      // 2. Verificar tamanho (limite de 1MB base64)
      if (fileContent.length > 1000000) {
        console.warn('⚠️ Arquivo muito grande:', fileContent.length, 'chars');
        return {
          success: false,
          error: 'Arquivo muito grande. Limite: 1MB base64.',
          suggestion: 'Tente um PDF menor'
        };
      }
      
      // 3. Enviar para API
      const requestData = {
        fileContent,
        fileName: file.name,
        preferences: {}
      };

      console.log('📤 Enviando requisição:', {
        fileName: file.name,
        fileSize: file.size,
        contentLength: fileContent.length,
        endpoint: `${API_BASE_URL}/analyze`
      });
      
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const endTime = Date.now();
      console.log('⏱️ Tempo de resposta:', endTime - startTime, 'ms');

      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API retornou erro:', response.status, errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          details: errorText
        };
      }

      const result = await response.json();
      console.log('✅ Análise concluída:', result);
      
      return result;

    } catch (error) {
      console.error('❌ Erro na análise completa:', error);
      return {
        success: false,
        error: 'Erro na requisição',
        details: error.message
      };
    }
  }
};

// Para usar no console do browser:
// debugApiService.testConnectivity()
// debugApiService.testAnalyzeEndpoint()
// ou com um arquivo: debugApiService.testCompleteAnalysis(file)