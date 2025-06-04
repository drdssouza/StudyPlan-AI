'use client';
import React from 'react';
import { 
  BookOpen, 
  Brain, 
  Target, 
  Clock, 
  Users, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Star,
  TrendingUp,
  Calendar,
  Shield,
  Sparkles
} from 'lucide-react';

interface HomePageProps {
  onNavigateToLogin: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">StudyPlan AI</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Recursos</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">Como Funciona</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Depoimentos</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Preços</a>
            </nav>

            <button
              onClick={onNavigateToLogin}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Powered by AI • Feito para Concurseiros
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
              Transforme seus
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> estudos </span>
              com IA
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Planos de estudo personalizados e inteligentes baseados em editais de concursos. 
              Otimize seu tempo e maximize seus resultados com tecnologia de ponta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onNavigateToLogin}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 flex items-center justify-center"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                Ver Demo
                <span className="ml-2">▶️</span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-600">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="font-medium">+500 concurseiros aprovados</span>
              </div>
              
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span>4.9/5 em avaliações</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o StudyPlan AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma combina inteligência artificial com metodologias comprovadas 
              para criar o plano de estudos perfeito para você.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Análise Inteligente de Editais</h3>
              <p className="text-gray-600">
                Nossa IA analisa editais de concursos e extrai automaticamente as matérias, 
                pesos e dificuldades para criar seu plano personalizado.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cronogramas Personalizados</h3>
              <p className="text-gray-600">
                Cronogramas adaptados à sua disponibilidade de tempo, priorizando matérias 
                de acordo com peso e dificuldade do concurso.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Acompanhamento de Progresso</h3>
              <p className="text-gray-600">
                Monitore seu desenvolvimento em tempo real com métricas detalhadas 
                e ajustes automáticos no plano conforme necessário.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Otimização de Tempo</h3>
              <p className="text-gray-600">
                Maximize cada minuto de estudo com distribuição inteligente de conteúdos 
                baseada em algoritmos de aprendizado.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Metodologia Comprovada</h3>
              <p className="text-gray-600">
                Baseado em técnicas de estudo científicamente comprovadas como 
                repetição espaçada e aprendizado ativo.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-100 p-8 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="bg-cyan-500 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Suporte Especializado</h3>
              <p className="text-gray-600">
                Equipe de especialistas em concursos públicos para orientar 
                sua jornada de estudos quando precisar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Como Funciona?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em apenas 3 passos simples, você terá um plano de estudos 
              personalizado e otimizado para seu concurso.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cole o Edital</h3>
              <p className="text-gray-600">
                Faça upload ou cole o texto do edital do seu concurso. 
                Nossa IA vai analisar e extrair todas as informações importantes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Configure Suas Preferências</h3>
              <p className="text-gray-600">
                Defina quantas horas por dia você pode estudar, seus dias disponíveis 
                e outras preferências pessoais.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Receba Seu Plano</h3>
              <p className="text-gray-600">
                Seu cronograma personalizado estará pronto! Acompanhe seu progresso 
                e ajuste conforme necessário.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-indigo-200">Aprovados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-indigo-200">Planos Criados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-indigo-200">Satisfação</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-indigo-200">Tipos de Concurso</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos usuários dizem
            </h2>
            <p className="text-xl text-gray-600">
              Histórias reais de pessoas que transformaram seus estudos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "O StudyPlan AI revolucionou minha preparação. Em 6 meses consegui 
                me organizar de forma que nunca imaginei ser possível."
              </p>
              <div className="flex items-center">
                <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">MF</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maria Fernanda</div>
                  <div className="text-gray-500 text-sm">Aprovada TRT-SP</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "A análise automática do edital me poupou horas de trabalho manual. 
                O cronograma gerado foi perfeito para minha rotina."
              </p>
              <div className="flex items-center">
                <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">CS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Carlos Silva</div>
                  <div className="text-gray-500 text-sm">Aprovado Receita Federal</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                "Finalmente um app que entende as necessidades de quem estuda para concurso. 
                Recomendo para todos os concurseiros!"
              </p>
              <div className="flex items-center">
                <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">AP</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ana Paula</div>
                  <div className="text-gray-500 text-sm">Aprovada TJSP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para transformar seus estudos?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Junte-se a centenas de concurseiros que já estão usando o StudyPlan AI 
            para otimizar seus estudos e alcançar a aprovação.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onNavigateToLogin}
              className="bg-white text-purple-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              Agendar Demo
            </button>
          </div>
          
          <p className="text-sm text-indigo-300 mt-4">
            ✅ Grátis para começar • ✅ Sem cartão de crédito • ✅ Suporte dedicado
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">StudyPlan AI</h3>
              </div>
              <p className="text-gray-400">
                Transformando a forma como você estuda para concursos públicos 
                com inteligência artificial.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Licenças</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StudyPlan AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;