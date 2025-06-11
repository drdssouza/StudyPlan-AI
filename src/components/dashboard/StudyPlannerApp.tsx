'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  Clock, 
  BookOpen, 
  Target, 
  Calendar, 
  Settings, 
  Edit3, 
  Check, 
  LogOut, 
  User,
  Brain,
  CheckCircle,
  FileText,
  AlertTriangle,
  Star,
  ArrowLeft,
  X
} from 'lucide-react';
import { authService } from '@/services/auth';
import { userDataService, UserProfile, UserStudyPlan } from '@/services/userData';
import { apiService } from '@/services/api';
import { User as UserType } from '@/types';
import TopicDifficultyConfigurator from '@/components/TopicDifficultyConfigurator';

interface StudyPlannerAppProps {
  user: UserType;
  onLogout: () => void;
}

const StudyPlannerApp: React.FC<StudyPlannerAppProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeStudyPlan, setActiveStudyPlan] = useState<UserStudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para upload de PDF
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para análise de edital
  const [analyzingEdital, setAnalyzingEdital] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Estados para configuração de tópicos
  const [topicConfigurations, setTopicConfigurations] = useState<Record<string, any>>({});
  const [topicConfigurationComplete, setTopicConfigurationComplete] = useState(false);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);

  // Estados para configuração
  const [studyHours, setStudyHours] = useState(4);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Verificar se usuário existe, se não inicializar
      let profile = await userDataService.getUserProfile(user.id);
      
      if (!profile) {
        profile = await userDataService.initializeUserProfile(user.id, user.email, user.name);
      }
      
      setUserProfile(profile);
      
      // Carregar plano ativo
      const activePlan = await userDataService.getActiveStudyPlan(user.id);
      if (activePlan) {
        setActiveStudyPlan(activePlan);
        setStudyHours(activePlan.preferences.hoursPerDay);
        setSelectedSubjects(activePlan.subjects.filter(s => s.selected).map(s => s.name));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      alert('Por favor, selecione apenas arquivos PDF.');
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      alert('Por favor, selecione apenas arquivos PDF.');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Upload e análise do PDF (SIMPLIFICADO)
  const handleUploadAndAnalyze = async () => {
    if (!uploadedFile) {
      alert('Por favor, selecione um arquivo PDF primeiro.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      console.log('Iniciando análise direta do PDF...');
      
      // Analisar PDF diretamente (sem upload separado)
      setUploadProgress(30);
      setAnalyzingEdital(true);
      
      const result = await apiService.analyzeEdital(uploadedFile);
      
      setUploadProgress(100);
      setAnalysisResult(result);
      setAnalyzingEdital(false);
      
      // Reset estados de upload
      setUploadedFile(null);
      setUploading(false);
      setUploadProgress(0);
      
      // Reset configurações
      setTopicConfigurations({});
      setTopicConfigurationComplete(false);
      
    } catch (error) {
      console.error('Erro no processo:', error);
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado',
        suggestion: 'Verifique o arquivo e tente novamente'
      });
      setAnalyzingEdital(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Função para lidar com mudanças na configuração de tópicos
  const handleTopicConfigurationChange = (subjectName: string, topicName: string, config: {
    userDifficulty: string;
    userNotes?: string;
  }) => {
    const key = `${subjectName}-${topicName}`;
    setTopicConfigurations(prev => ({
      ...prev,
      [key]: config
    }));

    // Verificar se todos os tópicos foram configurados
    if (analysisResult?.subjects) {
      const totalTopics = analysisResult.subjects.reduce((acc: number, subject: any) => 
        acc + (subject.topics?.length || 0), 0
      );
      const configuredCount = Object.keys({...topicConfigurations, [key]: config}).length;
      
      if (configuredCount >= totalTopics) {
        setTopicConfigurationComplete(true);
      }
    }
  };

  // Função para finalizar e criar o plano completo (SIMPLIFICADO)
  const handleFinalizeAndCreatePlan = async () => {
    if (!analysisResult?.success) return;
    
    setGeneratingSchedule(true);
    
    try {
      // Criar plano localmente (sem API)
      const planData = {
        name: analysisResult.examInfo?.name || 'Plano Personalizado',
        subjects: analysisResult.subjects?.map((subject: any) => ({
          ...subject,
          topics: subject.topics?.map((topic: any) => {
            const configKey = `${subject.name}-${topic.name}`;
            const config = topicConfigurations[configKey];
            
            return {
              ...topic,
              userDifficulty: config?.userDifficulty,
              userNotes: config?.userNotes,
              selected: true
            };
          }) || [],
          selected: true
        })) || [],
        examInfo: analysisResult.examInfo,
        progress: {
          totalHours: analysisResult.studyRecommendations?.totalEstimatedHours || 0,
          completedHours: 0,
          percentage: 0,
          weeklyGoal: studyHours * 6,
          currentWeekHours: 0
        },
        preferences: {
          hoursPerDay: studyHours,
          daysPerWeek: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
          priority: 'Personalizado baseado em dificuldades',
          preferredPeriod: 'Distribuído',
          includeRevisions: true,
          weeklySimulations: true
        }
      };

      // Salvar plano usando localStorage
      const newPlan = await userDataService.createStudyPlan(user.id, planData);
      setActiveStudyPlan(newPlan);
      await loadUserData();
      
      // Navegar para o cronograma
      setActiveTab('cronograma');
      
      // Limpar estados
      setAnalysisResult(null);
      setTopicConfigurations({});
      setTopicConfigurationComplete(false);
      
      console.log('Plano criado com sucesso:', newPlan);
      
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      alert('Erro ao criar plano. Tente novamente.');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">StudyPlan AI</h1>
            </div>
            
            <nav className="flex space-x-8">
              {['dashboard', 'edital', 'configuracao', 'cronograma'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab 
                      ? 'text-indigo-600 bg-indigo-50' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab === 'dashboard' && 'Dashboard'}
                  {tab === 'edital' && 'Edital'}
                  {tab === 'configuracao' && 'Configuração'}
                  {tab === 'cronograma' && 'Cronograma'}
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <User className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-2">
                Olá, {userProfile?.name?.split(' ')[0] || 'Estudante'}! 👋
              </h2>
              <p className="text-indigo-100">
                {activeStudyPlan 
                  ? `Continue seus estudos para ${activeStudyPlan.name}!`
                  : 'Pronto para criar seu primeiro plano de estudos?'
                }
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Horas/Dia</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeStudyPlan?.preferences.hoursPerDay || 0}h
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Matérias</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeStudyPlan?.subjects.filter(s => s.selected).length || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Horas Totais</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeStudyPlan?.progress.totalHours || 0}h
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Progresso</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {activeStudyPlan?.progress.percentage || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Study Plan ou Empty State */}
            {activeStudyPlan ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activeStudyPlan.name}</h2>
                    {activeStudyPlan.examInfo && (
                      <p className="text-sm text-gray-500">
                        {activeStudyPlan.examInfo.institution} • {activeStudyPlan.examInfo.salary}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveTab('configuracao')}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    Editar Plano
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso Geral</span>
                    <span>{activeStudyPlan.progress.completedHours}h / {activeStudyPlan.progress.totalHours}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${activeStudyPlan.progress.percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeStudyPlan.subjects.filter(s => s.selected).slice(0, 6).map((subject, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">{subject.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {subject.estimatedHours}h • {subject.difficulty}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">45%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano ativo</h3>
                <p className="text-gray-500 mb-6">Crie seu primeiro plano de estudos enviando um edital</p>
                <button 
                  onClick={() => setActiveTab('edital')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Analisar Edital
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('edital')}
                  className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Upload className="h-8 w-8 text-gray-400 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Novo Edital</p>
                    <p className="text-sm text-gray-500">Analisar novo concurso</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('configuracao')}
                  className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Settings className="h-8 w-8 text-gray-400 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Configurar Plano</p>
                    <p className="text-sm text-gray-500">Ajustar preferências</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('cronograma')}
                  className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Calendar className="h-8 w-8 text-gray-400 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Ver Cronograma</p>
                    <p className="text-sm text-gray-500">Plano semanal</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edital Tab */}
        {activeTab === 'edital' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise Inteligente de Edital</h2>
              <p className="text-gray-600">Envie o PDF do edital e configure suas dificuldades específicas para um plano personalizado</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`flex items-center space-x-2 ${!analysisResult ? 'text-indigo-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!analysisResult ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                  1
                </div>
                <span className="font-medium">Upload PDF</span>
              </div>
              
              <div className={`w-8 h-1 ${analysisResult ? 'bg-green-200' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${!analysisResult ? 'text-gray-400' : !topicConfigurationComplete ? 'text-indigo-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!analysisResult ? 'bg-gray-100 text-gray-400' : !topicConfigurationComplete ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                  2
                </div>
                <span className="font-medium">Configurar Dificuldades</span>
              </div>
              
              <div className={`w-8 h-1 ${topicConfigurationComplete ? 'bg-green-200' : 'bg-gray-200'}`}></div>
              
              <div className={`flex items-center space-x-2 ${!topicConfigurationComplete ? 'text-gray-400' : 'text-indigo-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!topicConfigurationComplete ? 'bg-gray-100 text-gray-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  3
                </div>
                <span className="font-medium">Gerar Cronograma</span>
              </div>
            </div>

            {/* Step 1: PDF Upload */}
            {!analysisResult && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">📄 Upload do Edital em PDF</h3>
                
                {/* Upload Area */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  
                  {!uploadedFile ? (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Selecione o arquivo PDF do edital</h4>
                      <p className="text-gray-500 mb-4">Arraste o arquivo aqui ou clique para selecionar</p>
                      <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                        Selecionar PDF
                      </button>
                    </div>
                  ) : (
                    <div>
                      <FileText className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{uploadedFile.name}</h4>
                      <p className="text-gray-500 mb-4">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <div className="flex items-center justify-center space-x-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remover
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadAndAnalyze();
                          }}
                          disabled={uploading || analyzingEdital}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Brain className="h-5 w-5" />
                          <span>Analisar com IA</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Progress */}
                {(uploading || analyzingEdital) && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>
                        {uploading ? 'Fazendo upload...' : 'Analisando com IA...'}
                      </span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    {analyzingEdital && (
                      <p className="text-sm text-gray-500 mt-2">
                        ⚡ Nossa IA está extraindo as disciplinas, pesos e conteúdos do edital...
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Topic Configuration */}
            {analysisResult && analysisResult.success && !topicConfigurationComplete && (
              <div className="space-y-6">
                {/* Analysis Results Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">✅ Análise Concluída!</h3>
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Nova análise
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.subjects?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Disciplinas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.subjects?.reduce((acc: number, subj: any) => acc + (subj.topics?.length || 0), 0) || 0}
                      </div>
                      <div className="text-sm text-gray-600">Tópicos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.studyRecommendations?.totalEstimatedHours || 0}h
                      </div>
                      <div className="text-sm text-gray-600">Horas Totais</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analysisResult.studyRecommendations?.recommendedMonths || 0}
                      </div>
                      <div className="text-sm text-gray-600">Meses</div>
                    </div>
                  </div>
                </div>

                {/* Topic Difficulty Configurator */}
                <TopicDifficultyConfigurator
                  subjects={analysisResult.subjects || []}
                  onConfigurationChange={handleTopicConfigurationChange}
                  onNext={() => setTopicConfigurationComplete(true)}
                />
              </div>
            )}

            {/* Step 3: Schedule Generation */}
            {topicConfigurationComplete && (
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Configuração Completa!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Agora vamos gerar seu cronograma personalizado baseado nas suas dificuldades específicas
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {Object.keys(topicConfigurations).length}
                      </div>
                      <div className="text-sm text-gray-600">Tópicos Configurados</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {studyHours}h
                      </div>
                      <div className="text-sm text-gray-600">Horas por Dia</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult?.subjects?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Disciplinas</div>
                    </div>
                  </div>

                  {/* Hours per day selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantas horas você pode estudar por dia?
                    </label>
                    <div className="flex items-center justify-center space-x-4">
                      <span className="text-sm text-gray-500">2h</span>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        value={studyHours}
                        onChange={(e) => setStudyHours(Number(e.target.value))}
                        className="w-64"
                      />
                      <span className="text-sm text-gray-500">12h</span>
                    </div>
                    <div className="text-lg font-semibold text-indigo-600 mt-2">{studyHours} horas por dia</div>
                  </div>

                  <button
                    onClick={handleFinalizeAndCreatePlan}
                    disabled={generatingSchedule}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 flex items-center space-x-2 mx-auto"
                  >
                    {generatingSchedule ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Gerando cronograma...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5" />
                        <span>Finalizar e Criar Plano Personalizado</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {analysisResult && !analysisResult.success && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ❌ Erro na Análise
                </h3>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                  <p className="text-red-800 font-medium">{analysisResult.error}</p>
                  {analysisResult.suggestion && (
                    <p className="text-red-600 text-sm mt-2">{analysisResult.suggestion}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => setAnalysisResult(null)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                  <button 
                    onClick={() => setActiveTab('configuracao')}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Configurar Manualmente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuração Tab - Simplificado */}
        {activeTab === 'configuracao' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuração do Plano</h2>
              <p className="text-gray-600">
                {activeStudyPlan ? `Configurando: ${activeStudyPlan.name}` : 'Crie um plano primeiro enviando um edital'}
              </p>
            </div>

            {activeStudyPlan ? (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horas de estudo por dia: {studyHours}h
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={studyHours}
                      onChange={(e) => setStudyHours(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matérias Selecionadas: {activeStudyPlan.subjects.filter(s => s.selected).length}
                    </label>
                    <p className="text-sm text-gray-500">
                      {activeStudyPlan.subjects.filter(s => s.selected).map(s => s.name).join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setActiveTab('cronograma')}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    Ver Cronograma
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano para configurar</h3>
                <p className="text-gray-500 mb-6">Crie um plano de estudos primeiro</p>
                <button 
                  onClick={() => setActiveTab('edital')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Analisar Edital
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cronograma Tab */}
        {activeTab === 'cronograma' && (
          <div className="space-y-8">
            {activeStudyPlan ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Cronograma Personalizado</h2>
                    <p className="text-gray-600">
                      {activeStudyPlan.name} • {activeStudyPlan.preferences.hoursPerDay}h/dia
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('configuracao')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Plano
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dia</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Manhã</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tarde</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Noite</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']).map((day, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{day}</td>
                            <td className="px-6 py-4">
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                                {activeStudyPlan.subjects[index % activeStudyPlan.subjects.length]?.name || 'Matéria'} - Teoria
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                                {activeStudyPlan.subjects[(index + 1) % activeStudyPlan.subjects.length]?.name || 'Matéria'} - Exercícios
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                                Revisão Geral
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso por Matéria</h3>
                    <div className="space-y-4">
                      {activeStudyPlan.subjects.filter(s => s.selected).slice(0, 5).map((subject, index) => {
                        const progress = Math.floor(Math.random() * 80) + 20;
                        return (
                          <div key={index}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                              <span className="text-sm text-gray-500">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Semanal</h3>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{activeStudyPlan.progress.currentWeekHours}</div>
                          <div className="text-sm opacity-80">de {activeStudyPlan.preferences.hoursPerDay * 6}h</div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        Você está {Math.round((activeStudyPlan.progress.currentWeekHours / (activeStudyPlan.preferences.hoursPerDay * 6)) * 100) || 0}% da sua meta semanal
                      </p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((activeStudyPlan.progress.currentWeekHours / (activeStudyPlan.preferences.hoursPerDay * 6)) * 100) || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cronograma disponível</h3>
                <p className="text-gray-500 mb-6">Crie um plano de estudos primeiro</p>
                <button 
                  onClick={() => setActiveTab('edital')}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Analisar Edital
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPlannerApp;