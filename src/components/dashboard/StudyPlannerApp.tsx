
'use client';
import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Clock, 
  BookOpen, 
  Target, 
  Calendar, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  LogOut, 
  User,
  Brain,
  CheckCircle
} from 'lucide-react';
import { authService } from '@/services/auth';
import { userDataService, UserProfile, UserStudyPlan } from '@/services/userData';
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
  
  // Estados para análise de edital
  const [editalText, setEditalText] = useState('');
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
      const profile = await userDataService.getUserProfile(user.id);
      
      if (profile) {
        setUserProfile(profile);
        
        // Carregar plano ativo
        const activePlan = await userDataService.getActiveStudyPlan(user.id);
        if (activePlan) {
          setActiveStudyPlan(activePlan);
          setStudyHours(activePlan.preferences.hoursPerDay);
          setSelectedSubjects(activePlan.subjects.filter(s => s.selected).map(s => s.name));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEdital = async () => {
    if (!editalText.trim()) {
      alert('Por favor, cole o texto do edital antes de analisar.');
      return;
    }

    setAnalyzingEdital(true);
    
    try {
      console.log('Iniciando análise detalhada do edital...');
      
      const response = await fetch('https://rvtyu6hh0c.execute-api.us-east-1.amazonaws.com/prod/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editalText: editalText,
          preferences: {},
          userPreferences: {} // Para futuras personalizações
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Análise detalhada concluída:', result);
      
      setAnalysisResult(result);
      
      // Reset dos estados de configuração
      setTopicConfigurations({});
      setTopicConfigurationComplete(false);
      
    } catch (error) {
      console.error('Erro ao analisar edital:', error);
      setAnalysisResult({
        success: false,
        error: 'Erro ao conectar com o servidor de análise',
        suggestion: 'Verifique sua conexão e tente novamente'
      });
    } finally {
      setAnalyzingEdital(false);
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

  // Função para calcular horas totais ajustadas
  const calculateTotalAdjustedHours = (): number => {
    if (!analysisResult?.subjects) return 0;
    
    let totalHours = 0;
    
    analysisResult.subjects.forEach((subject: any) => {
      subject.topics?.forEach((topic: any) => {
        const configKey = `${subject.name}-${topic.name}`;
        const config = topicConfigurations[configKey];
        
        if (config?.userDifficulty) {
          const multipliers = {
            'Muito Fácil': 0.5,
            'Fácil': 0.7,
            'Normal': 1.0,
            'Difícil': 1.3,
            'Muito Difícil': 1.8
          };
          
          const multiplier = multipliers[config.userDifficulty as keyof typeof multipliers] || 1.0;
          totalHours += Math.max(1, Math.round(topic.estimatedHours * multiplier));
        } else {
          totalHours += topic.estimatedHours || 0;
        }
      });
    });
    
    return totalHours;
  };

  // Função para calcular prioridades de estudo
  const calculateStudyPriorities = (): Array<{subject: string, topic: string, priority: number}> => {
    if (!analysisResult?.subjects) return [];
    
    const priorities: Array<{subject: string, topic: string, priority: number}> = [];
    
    analysisResult.subjects.forEach((subject: any) => {
      subject.topics?.forEach((topic: any) => {
        const configKey = `${subject.name}-${topic.name}`;
        const config = topicConfigurations[configKey];
        
        let priority = 50; // Base
        
        // Ajustar por dificuldade do usuário
        if (config?.userDifficulty) {
          const difficultyScores = {
            'Muito Fácil': 10,
            'Fácil': 25,
            'Normal': 50,
            'Difícil': 75,
            'Muito Difícil': 90
          };
          priority += difficultyScores[config.userDifficulty as keyof typeof difficultyScores] || 50;
        }
        
        // Ajustar por peso da disciplina
        if (subject.weight) {
          priority += subject.weight;
        }
        
        // Ajustar por dificuldade da IA
        const aiDifficultyScores = {
          'Baixo': 10,
          'Médio': 20,
          'Alto': 30
        };
        priority += aiDifficultyScores[topic.difficulty as keyof typeof aiDifficultyScores] || 20;
        
        priorities.push({
          subject: subject.name,
          topic: topic.name,
          priority: Math.min(priority, 200) // Limitar a 200
        });
      });
    });
    
    return priorities.sort((a, b) => b.priority - a.priority);
  };

  // Função para gerar cronograma detalhado
  const handleGenerateSchedule = async () => {
    setTopicConfigurationComplete(true);
    console.log('Configuração de tópicos completa!');
  };

  // Função auxiliar para calcular horas ajustadas por tópico
  const calculateAdjustedTopicHours = (originalHours: number, userDifficulty: string): number => {
    const multipliers = {
      'Muito Fácil': 0.5,
      'Fácil': 0.7,
      'Normal': 1.0,
      'Difícil': 1.3,
      'Muito Difícil': 1.8
    };
    
    const multiplier = multipliers[userDifficulty as keyof typeof multipliers] || 1.0;
    return Math.max(1, Math.round(originalHours * multiplier));
  };

  // Função auxiliar para calcular prioridade de um tópico específico
  const calculateTopicPriority = (subject: any, topic: any, config: any): number => {
    let priority = 50;
    
    // Dificuldade do usuário (peso maior)
    if (config?.userDifficulty) {
      const difficultyScores = {
        'Muito Fácil': 10,
        'Fácil': 25,
        'Normal': 50,
        'Difícil': 75,
        'Muito Difícil': 90
      };
      priority += (difficultyScores[config.userDifficulty as keyof typeof difficultyScores] || 50) * 0.6;
    }
    
    // Peso da disciplina
    if (subject.weight) {
      priority += (subject.weight * 0.3);
    }
    
    // Dificuldade da IA
    const aiDifficultyScores = {
      'Baixo': 10,
      'Médio': 20,
      'Alto': 30
    };
    priority += (aiDifficultyScores[topic.difficulty as keyof typeof aiDifficultyScores] || 20) * 0.1;
    
    return Math.round(priority);
  };

  // Função para gerar cronograma detalhado
  const generateDetailedSchedule = (subjects: any[]): Array<{day: string, morning: string, afternoon: string, evening: string}> => {
    const schedule = [];
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Coletar todos os tópicos com prioridades
    const allTopics: Array<{
      subject: string,
      topic: string, 
      hours: number,
      priority: number,
      methods: string[]
    }> = [];
    
    subjects.forEach(subject => {
      subject.topics?.forEach((topic: any) => {
        allTopics.push({
          subject: subject.name,
          topic: topic.name,
          hours: topic.adjustedHours || topic.estimatedHours,
          priority: topic.priority || 50,
          methods: topic.studyMethods || ['teoria', 'exercicios']
        });
      });
    });
    
    // Ordenar por prioridade
    allTopics.sort((a, b) => b.priority - a.priority);
    
    // Distribuir pelos dias da semana
    let currentTopicIndex = 0;
    const hoursPerPeriod = Math.floor(studyHours / 3); // Dividir em 3 períodos
    
    for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
      const day = days[dayIndex];
      
      // Manhã - Tópicos de alta prioridade
      const morningTopic = allTopics[currentTopicIndex % allTopics.length];
      const morning = `${morningTopic.topic} (${hoursPerPeriod}h) - ${morningTopic.methods[0] || 'teoria'}`;
      
      // Tarde - Exercícios ou revisão
      currentTopicIndex++;
      const afternoonTopic = allTopics[currentTopicIndex % allTopics.length];
      const afternoon = `${afternoonTopic.topic} - Exercícios (${hoursPerPeriod}h)`;
      
      // Noite - Revisão ou tópico secundário
      currentTopicIndex++;
      const eveningActivity = dayIndex % 2 === 0 ? 
        'Revisão geral (1h)' : 
        `${allTopics[(currentTopicIndex + 1) % allTopics.length].topic} - Resumo (1h)`;
      
      schedule.push({
        day,
        morning,
        afternoon,
        evening: eveningActivity
      });
      
      currentTopicIndex++;
    }
    
    return schedule;
  };

  // Função para finalizar e criar o plano completo
  const handleFinalizeAndCreatePlan = async () => {
    if (!analysisResult?.success) return;
    
    setGeneratingSchedule(true);
    
    try {
      // Preparar dados do plano com configurações detalhadas
      const enhancedSubjects = analysisResult.subjects.map((subject: any) => ({
        ...subject,
        topics: subject.topics?.map((topic: any) => {
          const configKey = `${subject.name}-${topic.name}`;
          const config = topicConfigurations[configKey];
          
          return {
            ...topic,
            userDifficulty: config?.userDifficulty,
            userNotes: config?.userNotes,
            adjustedHours: config?.userDifficulty ? calculateAdjustedTopicHours(topic.estimatedHours, config.userDifficulty) : topic.estimatedHours,
            priority: calculateTopicPriority(subject, topic, config),
            selected: true
          };
        }) || []
      }));

      // Gerar cronograma detalhado
      const detailedSchedule = generateDetailedSchedule(enhancedSubjects);
      
      // Criar plano enriquecido para salvar
      const planData = {
        name: analysisResult.examInfo?.name || 'Plano Personalizado',
        editalText,
        subjects: enhancedSubjects,
        examInfo: analysisResult.examInfo,
        schedule: detailedSchedule,
        progress: {
          totalHours: calculateTotalAdjustedHours(),
          completedHours: 0,
          percentage: 0,
          weeklyGoal: studyHours * 6, // 6 dias por semana
          currentWeekHours: 0
        },
        preferences: {
          hoursPerDay: studyHours,
          daysPerWeek: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
          priority: 'Personalizado baseado em dificuldades',
          preferredPeriod: 'Distribuído',
          includeRevisions: true,
          weeklySimulations: true
        },
        metadata: {
          configuredTopics: Object.keys(topicConfigurations).length,
          analysisVersion: '3.0-detailed',
          createdWithAI: true,
          userCustomizations: true
        }
      };

      // Salvar plano no sistema
      const newPlan = await userDataService.createStudyPlan(user.id, planData);
      setActiveStudyPlan(newPlan);
      await loadUserData();
      
      // Navegar para o cronograma
      setActiveTab('cronograma');
      
      // Limpar estados
      setAnalysisResult(null);
      setTopicConfigurations({});
      setTopicConfigurationComplete(false);
      setEditalText('');
      
      console.log('Plano criado com sucesso:', newPlan);
      
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      alert('Erro ao criar plano. Tente novamente.');
    } finally {
      setGeneratingSchedule(false);
    }
  };

  const handleUpdateStudyHours = async (hours: number) => {
    setStudyHours(hours);
    
    if (activeStudyPlan) {
      const updatedPlan = await userDataService.updateStudyPlan(user.id, activeStudyPlan.id, {
        preferences: {
          ...activeStudyPlan.preferences,
          hoursPerDay: hours
        }
      });
      setActiveStudyPlan(updatedPlan);
    }
  };

  const handleSubjectToggle = async (subjectName: string) => {
    if (!activeStudyPlan) return;

    const updatedSubjects = activeStudyPlan.subjects.map(subject =>
      subject.name === subjectName 
        ? { ...subject, selected: !subject.selected }
        : subject
    );

    const updatedPlan = await userDataService.updateStudyPlan(user.id, activeStudyPlan.id, {
      subjects: updatedSubjects
    });

    setActiveStudyPlan(updatedPlan);
    setSelectedSubjects(updatedSubjects.filter(s => s.selected).map(s => s.name));
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

            {/* Current Study Plan */}
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
                  {activeStudyPlan.subjects.filter(s => s.selected).map((subject, index) => (
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
              // Empty State
              <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-100 text-center">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano ativo</h3>
                <p className="text-gray-500 mb-6">Crie seu primeiro plano de estudos analisando um edital</p>
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
              <p className="text-gray-600">Envie o edital e configure suas dificuldades específicas para um plano personalizado</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className={`flex items-center space-x-2 ${!analysisResult ? 'text-indigo-600' : 'text-green-600'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!analysisResult ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                  1
                </div>
                <span className="font-medium">Analisar Edital</span>
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

            {/* Step 1: Edital Analysis */}
            {!analysisResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload do Edital</h3>
                    <p className="text-gray-500 mb-4">Arraste o arquivo PDF ou clique para selecionar</p>
                    <button 
                      onClick={() => alert('Funcionalidade em desenvolvimento')}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Selecionar Arquivo
                    </button>
                  </div>
                </div>

                {/* Text Input */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Cole o Conteúdo do Edital</h3>
                  <textarea
                    value={editalText}
                    onChange={(e) => setEditalText(e.target.value)}
                    placeholder="Cole aqui o conteúdo do edital completo, incluindo o conteúdo programático..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {editalText.length} caracteres | Mínimo recomendado: 500 caracteres
                  </div>
                  
                  <button 
                    onClick={handleAnalyzeEdital}
                    disabled={analyzingEdital || !editalText.trim() || editalText.length < 50}
                    className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full justify-center"
                  >
                    {analyzingEdital ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Analisando com IA...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5" />
                        <span>Analisar com Inteligência Artificial</span>
                      </>
                    )}
                  </button>
                </div>
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
                  onNext={handleGenerateSchedule}
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
                        {calculateTotalAdjustedHours()}h
                      </div>
                      <div className="text-sm text-gray-600">Horas Ajustadas</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {calculateStudyPriorities().length}
                      </div>
                      <div className="text-sm text-gray-600">Prioridades</div>
                    </div>
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

        {/* Configuração Tab */}
        {activeTab === 'configuracao' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuração do Plano</h2>
              <p className="text-gray-600">
                {activeStudyPlan ? `Configurando: ${activeStudyPlan.name}` : 'Personalize seu plano de estudos'}
              </p>
            </div>

            {activeStudyPlan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Study Hours */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Horas de Estudo</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horas por dia: {studyHours}h
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="12"
                        value={studyHours}
                        onChange={(e) => handleUpdateStudyHours(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1h</span>
                        <span>12h</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dias da semana</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => {
                          const isSelected = activeStudyPlan.preferences.daysPerWeek.includes(day.toLowerCase());
                          return (
                            <label key={day} className="flex items-center space-x-2">
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                className="rounded" 
                                readOnly
                              />
                              <span className="text-sm text-gray-700">{day}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject Selection */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Matérias</h3>
                  <div className="space-y-3">
                    {activeStudyPlan.subjects.map((subject, index) => (
                      <label key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={subject.selected}
                            onChange={() => handleSubjectToggle(subject.name)}
                            className="rounded mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{subject.name}</p>
                            <p className="text-xs text-gray-500">
                              Peso: {subject.weight}% • {subject.estimatedHours}h
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          subject.difficulty === 'Alto' ? 'bg-red-100 text-red-800' :
                          subject.difficulty === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {subject.difficulty}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        value={activeStudyPlan.preferences.priority}
                        readOnly
                      >
                        <option>Matérias com maior peso</option>
                        <option>Matérias mais difíceis</option>
                        <option>Distribuição equilibrada</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Período preferido</label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                        value={activeStudyPlan.preferences.preferredPeriod}
                        readOnly
                      >
                        <option>Manhã</option>
                        <option>Tarde</option>
                        <option>Noite</option>
                        <option>Distribuído</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={activeStudyPlan.preferences.includeRevisions}
                          readOnly
                        />
                        <span className="text-sm text-gray-700">Incluir revisões</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={activeStudyPlan.preferences.weeklySimulations}
                          readOnly
                        />
                        <span className="text-sm text-gray-700">Simulados semanais</span>
                      </label>
                    </div>
                  </div>
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

            {/* Generate Button */}
            {activeStudyPlan && (
              <div className="text-center">
                <button 
                  onClick={() => setActiveTab('cronograma')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                >
                  Ver Cronograma Atualizado
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
                      {activeStudyPlan.metadata?.createdWithAI && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          ✨ Gerado com IA
                        </span>
                      )}
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
                        {activeStudyPlan.schedule.map((day, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{day.day}</td>
                            <td className="px-6 py-4">
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                                {day.morning}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                                {day.afternoon}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                                {day.evening}
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
                      {activeStudyPlan.subjects.filter(s => s.selected).map((subject, index) => {
                        const progress = Math.floor(Math.random() * 80) + 20; // Mock progress
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
                          <div className="text-sm opacity-80">de {activeStudyPlan.preferences.hoursPerDay * 5}h</div>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        Você está {Math.round((activeStudyPlan.progress.currentWeekHours / (activeStudyPlan.preferences.hoursPerDay * 5)) * 100)}% da sua meta semanal
                      </p>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                          style={{ width: `${Math.round((activeStudyPlan.progress.currentWeekHours / (activeStudyPlan.preferences.hoursPerDay * 5)) * 100)}%` }}
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