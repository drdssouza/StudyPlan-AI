'use client';
import React, { useState } from 'react';
import { Upload, Clock, BookOpen, Target, Calendar, Settings, Plus, Edit3, Trash2, Check, LogOut, User } from 'lucide-react';
import { authService } from '@/services/auth';
import { User as UserType, Subject, ScheduleItem } from '@/types';

interface StudyPlannerAppProps {
  user: UserType;
  onLogout: () => void;
}

const StudyPlannerApp: React.FC<StudyPlannerAppProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [studyHours, setStudyHours] = useState(4);
  const [selectedSubjects, setSelectedSubjects] = useState(['Direito Constitucional', 'Direito Administrativo', 'Português']);

  const mockSubjects: Subject[] = [
    { name: 'Direito Constitucional', weight: 30, difficulty: 'Alto', estimated: '40h' },
    { name: 'Direito Administrativo', weight: 25, difficulty: 'Alto', estimated: '35h' },
    { name: 'Português', weight: 20, difficulty: 'Médio', estimated: '25h' },
    { name: 'Matemática', weight: 15, difficulty: 'Alto', estimated: '30h' },
    { name: 'Informática', weight: 10, difficulty: 'Baixo', estimated: '15h' }
  ];

  const mockSchedule: ScheduleItem[] = [
    { day: 'Segunda', morning: 'Direito Constitucional (2h)', afternoon: 'Português (1h)', evening: 'Revisão (1h)' },
    { day: 'Terça', morning: 'Direito Administrativo (2h)', afternoon: 'Matemática (1h)', evening: 'Exercícios (1h)' },
    { day: 'Quarta', morning: 'Direito Constitucional (2h)', afternoon: 'Informática (1h)', evening: 'Simulado (1h)' },
    { day: 'Quinta', morning: 'Direito Administrativo (2h)', afternoon: 'Português (1h)', evening: 'Revisão (1h)' },
    { day: 'Sexta', morning: 'Matemática (2h)', afternoon: 'Direito Constitucional (1h)', evening: 'Exercícios (1h)' }
  ];

  const handleLogout = async () => {
    const result = await authService.signOut();
    if (result.success) {
      onLogout();
    }
  };

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
              <h2 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name?.split(' ')[0] || 'Estudante'}!</h2>
              <p className="text-indigo-100">Pronto para continuar seus estudos? Vamos alcançar seus objetivos juntos!</p>
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
                    <p className="text-2xl font-bold text-gray-900">{studyHours}h</p>
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
                    <p className="text-2xl font-bold text-gray-900">{selectedSubjects.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">Duração</p>
                    <p className="text-2xl font-bold text-gray-900">12 sem</p>
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
                    <p className="text-2xl font-bold text-gray-900">23%</p>
                  </div>
                </div>
              </div>
            </div>

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
                    <p className="text-sm text-gray-500">Upload ou cole o edital</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('configuracao')}
                  className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                >
                  <Settings className="h-8 w-8 text-gray-400 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Configurar Plano</p>
                    <p className="text-sm text-gray-500">Personalizar estudos</p>
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

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Direito Constitucional - Aula 1</p>
                      <p className="text-sm text-gray-500">Concluído há 2 horas</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">100%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Simulado - Português</p>
                      <p className="text-sm text-gray-500">Em andamento</p>
                    </div>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">65%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edital Tab */}
        {activeTab === 'edital' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Análise de Edital</h2>
              <p className="text-gray-600">Faça upload do edital ou cole o conteúdo para gerar seu plano personalizado</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Area */}
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload do Edital</h3>
                  <p className="text-gray-500 mb-4">Arraste o arquivo PDF ou clique para selecionar</p>
                  <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Selecionar Arquivo
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ou Cole o Conteúdo</h3>
                <textarea
                  placeholder="Cole aqui o conteúdo do edital..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Analisar Conteúdo
                </button>
              </div>
            </div>

            {/* Analysis Results Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prévia da Análise</h3>
              <div className="space-y-4">
                {mockSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                      <div>
                        <p className="font-medium text-gray-900">{subject.name}</p>
                        <p className="text-sm text-gray-500">Peso: {subject.weight}% • {subject.difficulty} • {subject.estimated}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <Edit3 className="h-4 w-4 text-gray-500" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Configuração Tab */}
        {activeTab === 'configuracao' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuração do Plano</h2>
              <p className="text-gray-600">Personalize seu plano de estudos conforme sua disponibilidade</p>
            </div>

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
                      onChange={(e) => setStudyHours(Number(e.target.value))}
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
                      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
                        <label key={day} className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked={day !== 'Dom'} className="rounded" />
                          <span className="text-sm text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Matérias</h3>
                <div className="space-y-3">
                  {mockSubjects.map((subject, index) => (
                    <label key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects([...selectedSubjects, subject.name]);
                            } else {
                              setSelectedSubjects(selectedSubjects.filter(s => s !== subject.name));
                            }
                          }}
                          className="rounded mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{subject.name}</p>
                          <p className="text-xs text-gray-500">Peso: {subject.weight}%</p>
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
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option>Matérias com maior peso</option>
                      <option>Matérias mais difíceis</option>
                      <option>Distribuição equilibrada</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Período preferido</label>
                    <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option>Manhã</option>
                      <option>Tarde</option>
                      <option>Noite</option>
                      <option>Distribuído</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">Incluir revisões</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm text-gray-700">Simulados semanais</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105">
                Gerar Plano de Estudos
              </button>
            </div>
          </div>
        )}

        {/* Cronograma Tab */}
        {activeTab === 'cronograma' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cronograma Semanal</h2>
                <p className="text-gray-600">Seu plano personalizado baseado em {studyHours}h/dia</p>
              </div>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
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
                    {mockSchedule.map((day, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{day.day}</td>
                        <td className="px-6 py-4">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {day.morning}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {day.afternoon}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
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
                  {selectedSubjects.map((subject, index) => {
                    const progress = [75, 45, 60][index] || 30;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{subject}</span>
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
                      <div className="text-2xl font-bold">18</div>
                      <div className="text-sm opacity-80">de 28h</div>
                    </div>
                  </div>
                  <p className="text-gray-600">Você está 64% da sua meta semanal</p>
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyPlannerApp;