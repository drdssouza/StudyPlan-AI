// src/components/DebugPanel.tsx
'use client';
import React, { useState, useRef } from 'react';
import { AlertTriangle, Play, CheckCircle, XCircle, Upload } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const clearLog = () => {
    setDebugLog([]);
  };

  const testApiConnectivity = async () => {
    setIsRunning(true);
    log('🔍 Testando conectividade da API...');
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    
    log(`📍 API_BASE_URL: ${API_BASE_URL || 'NÃO CONFIGURADA'}`);
    
    if (!API_BASE_URL) {
      log('❌ PROBLEMA: API_BASE_URL não está configurada!');
      log('💡 Solução: Configurar NEXT_PUBLIC_API_BASE_URL no .env.local');
      setIsRunning(false);
      return;
    }

    try {
      // Teste 1: Endpoint /analyze
      log('📡 Testando endpoint /analyze...');
      
      const testData = {
        fileContent: btoa('Teste básico de PDF'),
        fileName: 'teste.pdf',
        preferences: {}
      };

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      log(`📊 Status da resposta: ${response.status} ${response.statusText}`);
      log(`📊 Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);

      if (response.ok) {
        const result = await response.text();
        log(`✅ Resposta recebida (${result.length} chars)`);
        
        try {
          const jsonResult = JSON.parse(result);
          log(`✅ JSON válido: ${JSON.stringify(jsonResult, null, 2)}`);
        } catch (e) {
          log(`⚠️ Resposta não é JSON: ${result.substring(0, 200)}...`);
        }
      } else {
        const errorText = await response.text();
        log(`❌ Erro na resposta: ${errorText}`);
      }

    } catch (error) {
      log(`❌ Erro de rede: ${error.message}`);
      log(`💡 Verifique se a API está rodando e o CORS está configurado`);
    }
    
    setIsRunning(false);
  };

  const testFileUpload = async () => {
    if (!selectedFile) {
      log('❌ Nenhum arquivo selecionado');
      return;
    }

    setIsRunning(true);
    log(`🚀 Testando upload do arquivo: ${selectedFile.name}`);
    log(`📄 Tamanho: ${(selectedFile.size / 1024).toFixed(2)} KB`);
    log(`📄 Tipo: ${selectedFile.type}`);

    try {
      // Converter para base64
      log('🔄 Convertendo para base64...');
      const base64 = await fileToBase64(selectedFile);
      log(`✅ Conversão concluída: ${base64.length} chars`);

      if (base64.length > 1000000) {
        log(`⚠️ Arquivo muito grande: ${base64.length} chars (limite: 1MB)`);
      }

      // Testar API
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      
      const requestData = {
        fileContent: base64,
        fileName: selectedFile.name,
        preferences: {}
      };

      log('📤 Enviando para API...');
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const endTime = Date.now();
      log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);

      log(`📊 Status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const result = await response.json();
        log(`✅ Sucesso: ${JSON.stringify(result, null, 2)}`);
      } else {
        const errorText = await response.text();
        log(`❌ Erro: ${errorText}`);
      }

    } catch (error) {
      log(`❌ Erro no teste: ${error.message}`);
    }

    setIsRunning(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]); // Remove prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      log(`📄 Arquivo selecionado: ${file.name}`);
    } else {
      log('❌ Selecione apenas arquivos PDF');
    }
  };

  return (
    <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
          Debug Panel - API Testing
        </h3>
        <button
          onClick={clearLog}
          className="bg-gray-700 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
        >
          Limpar Log
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-white mb-2">Environment Check</h4>
          <div className="bg-gray-800 p-2 rounded text-xs">
            <div>NODE_ENV: {process.env.NODE_ENV || 'undefined'}</div>
            <div>API_BASE_URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'NÃO CONFIGURADA'}</div>
          </div>
        </div>

        <div>
          <h4 className="text-white mb-2">Arquivo de Teste</h4>
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 flex items-center"
            >
              <Upload className="h-3 w-3 mr-1" />
              Selecionar PDF
            </button>
            {selectedFile && (
              <span className="text-xs text-gray-300">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}KB)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={testApiConnectivity}
          disabled={isRunning}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
        >
          <Play className="h-4 w-4 mr-2" />
          Testar API
        </button>

        <button
          onClick={testFileUpload}
          disabled={isRunning || !selectedFile}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <Upload className="h-4 w-4 mr-2" />
          Testar Upload
        </button>
      </div>

      <div className="bg-black p-4 rounded max-h-96 overflow-y-auto">
        <div className="text-gray-400 text-xs mb-2">Log de Debug:</div>
        {debugLog.length === 0 ? (
          <div className="text-gray-500">Nenhum log ainda. Execute um teste.</div>
        ) : (
          debugLog.map((entry, index) => (
            <div key={index} className="mb-1">
              {entry}
            </div>
          ))
        )}
        {isRunning && (
          <div className="text-yellow-400 animate-pulse">
            ⏳ Executando teste...
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400">
        💡 Dicas:
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Verifique se NEXT_PUBLIC_API_BASE_URL está no .env.local</li>
          <li>Confirme se a API Gateway está funcionando</li>
          <li>Teste primeiro sem arquivo, depois com arquivo pequeno</li>
          <li>Verifique CORS se der erro de rede</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugPanel;