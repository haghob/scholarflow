import { Link } from 'react-router-dom';
import { Search, BookOpen, TrendingUp, Users, Award, Zap, Database } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-20">
      {/* Hero Section avec gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10"></div>
        <div className="relative text-center py-24 px-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce">
            <Zap className="h-4 w-4" />
            <span>Nouveau : Recommandations IA personnalisées</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ScholarFlow
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your intelligent academic article aggregator. Discover, organize, and stay updated 
            with the <span className="font-semibold text-blue-600">latest research</span> in your field.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link 
              to="/register" 
              className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-white text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg border-2 border-gray-200 hover:border-blue-300 flex items-center justify-center gap-2"
            >
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">10M+</div>
              <div className="text-gray-600 text-sm">Articles indexed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">50K+</div>
              <div className="text-gray-600 text-sm">Active researchers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">1M+</div>
              <div className="text-gray-600 text-sm">Citations tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid avec cartes modernes */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need for research
          </h2>
          <p className="text-xl text-gray-600">
            Powerful tools designed for modern researchers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Search className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Smart Search</h3>
            <p className="text-gray-600 leading-relaxed">
              Find relevant articles quickly with our AI-powered semantic search engine. 
              Filter by date, citations, impact factor, and more.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
            <div className="h-14 w-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Database className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Multiple Sources</h3>
            <p className="text-gray-600 leading-relaxed">
              Access millions of papers from ArXiv, PubMed, CrossRef, CORE, and more. 
              All in one unified platform.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
            <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">AI Recommendations</h3>
            <p className="text-gray-600 leading-relaxed">
              Get personalized article suggestions based on your research interests, 
              reading history, and citation patterns.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:-translate-y-2">
            <div className="h-14 w-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="h-7 w-7 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Organize & Annotate</h3>
            <p className="text-gray-600 leading-relaxed">
              Create collections, add notes, highlight key findings, and organize 
              your research library effortlessly.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200 hover:-translate-y-2">
            <div className="h-14 w-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="h-7 w-7 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Collaborate</h3>
            <p className="text-gray-600 leading-relaxed">
              Share collections with your team, collaborate on research projects, 
              and discover what your peers are reading.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-yellow-200 hover:-translate-y-2">
            <div className="h-14 w-14 bg-yellow-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="h-7 w-7 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Citation Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Track citations, visualize research networks, and discover influential 
              papers in your field with interactive graphs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section avec background gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 -z-10"></div>
        <div className="relative max-w-4xl mx-auto text-center py-20 px-4 text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to streamline your research?
          </h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of researchers using ScholarFlow to stay ahead in their field
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            Create Free Account →
          </Link>
          <p className="mt-6 text-sm text-blue-100">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Trusted by section */}
      <section className="max-w-6xl mx-auto px-4 text-center pb-20">
        <p className="text-gray-500 text-sm uppercase tracking-wider mb-8">
          Trusted by researchers at
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
          <div className="text-2xl font-bold text-gray-400">MIT</div>
          <div className="text-2xl font-bold text-gray-400">Stanford</div>
          <div className="text-2xl font-bold text-gray-400">Oxford</div>
          <div className="text-2xl font-bold text-gray-400">Cambridge</div>
          <div className="text-2xl font-bold text-gray-400">Sorbonne</div>
        </div>
      </section>
    </div>
  );
};

export default Home;