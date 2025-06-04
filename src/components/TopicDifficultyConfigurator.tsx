'use client';
import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  Star,
  Brain
} from 'lucide-react';

interface Topic {
  name: string;
  description: string;
  difficulty: 'Baixo' | 'Médio' | 'Alto';
  estimatedHours: number;
  isOptional: boolean;
  studyMethods: string[];
  userDifficulty?: 'Muito Fácil' | 'Fácil' | 'Normal' | 'Difícil' | 'Muito Difícil';
  userNotes?: string;
}

interface Subject {
  name: string;
  difficulty: 'Baixo' | 'Médio' | 'Alto';
  topics: Topic[];
  estimatedHours: number;
  topicsCount: number;
}

interface TopicDifficultyConfiguratorProps {
  subjects: Subject[];
  onConfigurationChange: (subjectName: string, topicName: string, config: {
    userDifficulty: string;
    userNotes?: string;
  }) => void;
  onNext: () => void;
}

const TopicDifficultyConfigurator: React.FC<TopicDifficultyConfiguratorProps> = ({
  subjects,
  onConfigurationChange,
  onNext
}) => {
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, any>>({});

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects(prev => 
      prev.includes(subjectName) 
        ? prev.filter(name => name !== subjectName)
        : [...prev, subjectName]
    );
  };

  const handleTopicConfig = (subjectName: string, topicName: string, field: string, value: string) => {
    const key = `${subjectName}-${topicName}`;
    const currentConfig = selectedConfigs[key] || {};
    const newConfig = { ...currentConfig, [field]: value };
    
    setSelectedConfigs(prev => ({
      ...prev,
      [key]: newConfig
    }));

    onConfigurationChange(subjectName, topicName, newConfig);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Muito Fácil': return 'text-green-600 bg-green-100';
      case 'Fácil': return 'text-green-500 bg-green-50';
      case 'Normal': return 'text-blue-600 bg-blue-100';
      case 'Difícil': return 'text-orange-600 bg-orange-100';
      case 'Muito Difícil': return 'text-red-600 bg-red-100';
      case 'Alto': return 'text-red-600 bg-red-100';
      case 'Médio': return 'text-yellow-600 bg-yellow-100';
      case 'Baixo': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStudyMethodIcon = (method: string) => {
    switch (method) {
      case 'legislacao': return '📜';
      case 'jurisprudencia': return '⚖️';
      case 'exercicios': return '✏️';
      case 'teoria': return '📚';
      case 'pratica': return '💻';
      case 'redacao': return '✍️';
      default: return '📖';
    }
  };

  const totalConfigured = Object.keys(selectedConfigs).length;
  const totalTopics = subjects.reduce((acc, subject) => acc + subject.topics.length, 0);
  const progressPercentage = totalTopics > 0 ? (totalConfigured / totalTopics) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Configure Suas Dificuldades</h2>
            <p className="text-indigo-100">
              Ajuste a dificuldade de cada tópico conforme seu conhecimento atual
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-indigo-200">Configurado</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-indigo-500 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-indigo-200 mt-1">
            <span>{totalConfigured} de {totalTopics} tópicos</span>
            <span>{subjects.length} disciplinas</span>
          </div>
        </div>
      </div>

      {/* Subjects and Topics */}
      <div className="space-y-4">
        {subjects.map((subject, subjectIndex) => (
          <div key={subjectIndex} className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Subject Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSubject(subject.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {expandedSubjects.includes(subject.name) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(subject.difficulty)}`}>
                        {subject.difficulty}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {subject.estimatedHours}h
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Brain className="h-4 w-4 mr-1" />
                        {subject.topicsCount} tópicos
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {subject.topics.filter(topic => selectedConfigs[`${subject.name}-${topic.name}`]).length} / {subject.topics.length}
                  </div>
                  <div className="text-xs text-gray-400">configurados</div>
                </div>
              </div>
            </div>

            {/* Topics List */}
            {expandedSubjects.includes(subject.name) && (
              <div className="border-t border-gray-100">
                <div className="p-4 space-y-4">
                  {subject.topics.map((topic, topicIndex) => {
                    const configKey = `${subject.name}-${topic.name}`;
                    const currentConfig = selectedConfigs[configKey] || {};
                    const isConfigured = currentConfig.userDifficulty;

                    return (
                      <div key={topicIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{topic.name}</h4>
                              {isConfigured && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{topic.description}</p>
                            
                            {/* Study Methods */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {topic.studyMethods.map((method, idx) => (
                                <span key={idx} className="inline-flex items-center text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  <span className="mr-1">{getStudyMethodIcon(method)}</span>
                                  {method}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                                IA: {topic.difficulty}
                              </span>
                              <div className="flex items-center text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {topic.estimatedHours}h estimadas
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Difficulty Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sua dificuldade com este tópico:
                            </label>
                            <select
                              value={currentConfig.userDifficulty || ''}
                              onChange={(e) => handleTopicConfig(subject.name, topic.name, 'userDifficulty', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            >
                              <option value="">Selecione...</option>
                              <option value="Muito Fácil">😊 Muito Fácil - Domino completamente</option>
                              <option value="Fácil">🙂 Fácil - Tenho boa base</option>
                              <option value="Normal">😐 Normal - Preciso estudar</option>
                              <option value="Difícil">😬 Difícil - Tenho dificuldades</option>
                              <option value="Muito Difícil">😰 Muito Difícil - Nunca estudei</option>
                            </select>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observações (opcional):
                            </label>
                            <textarea
                              value={currentConfig.userNotes || ''}
                              onChange={(e) => handleTopicConfig(subject.name, topic.name, 'userNotes', e.target.value)}
                              placeholder="Ex: Já estudei na faculdade, preciso revisar jurisprudência..."
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Time Adjustment Preview */}
                        {currentConfig.userDifficulty && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-800">
                                ⏱️ Tempo ajustado baseado na sua dificuldade:
                              </span>
                              <span className="font-semibold text-blue-900">
                                {calculateAdjustedHours(topic.estimatedHours, currentConfig.userDifficulty)}h
                                {calculateAdjustedHours(topic.estimatedHours, currentConfig.userDifficulty) !== topic.estimatedHours && (
                                  <span className="text-blue-600 ml-1">
                                    (era {topic.estimatedHours}h)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumo da Configuração</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {['Muito Fácil', 'Fácil', 'Normal', 'Difícil', 'Muito Difícil'].map(difficulty => {
            const count = Object.values(selectedConfigs).filter(config => config.userDifficulty === difficulty).length;
            return (
              <div key={difficulty} className="text-center">
                <div className={`text-2xl font-bold ${getDifficultyColor(difficulty).split(' ')[0]}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-600">{difficulty}</div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {totalConfigured < totalTopics ? (
              <span className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                Configure todos os tópicos para gerar um cronograma otimizado
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Configuração completa! Pronto para gerar cronograma personalizado
              </span>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={totalConfigured < totalTopics}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            <span>Gerar Cronograma Personalizado</span>
            <Star className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Função auxiliar para calcular horas ajustadas
const calculateAdjustedHours = (originalHours: number, userDifficulty: string): number => {
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

export default TopicDifficultyConfigurator;