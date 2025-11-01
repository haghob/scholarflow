// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { BookOpen, TrendingUp, Star, Clock, ExternalLink } from 'lucide-react';
import axios from 'axios';

interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  citations: number;
  tags: string[];
  source: string;
  url: string;
}

interface DashboardStats {
  savedArticles: number;
  newArticles: number;
  collections: number;
  readingList: number;
}

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats>({
    savedArticles: 0,
    newArticles: 0,
    collections: 0,
    readingList: 0
  });
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Récupère tous les articles (limité à 5 pour le dashboard)
      const articlesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/articles`,
        {
          params: { limit: 5, sort: '-publishedDate' },
          headers
        }
      );

      const articles = articlesResponse.data.data?.articles || articlesResponse.data.articles || [];
      setRecentArticles(articles);

      // Compte le total d'articles dans la base
      const totalResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/articles`,
        {
          params: { limit: 1 },
          headers
        }
      );
      
      const total = totalResponse.data.data?.total || totalResponse.data.total || articles.length;

      // Compte les articles de cette semaine
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weekArticles = articles.filter((a: Article) => 
        new Date(a.publishedDate) > oneWeekAgo
      );

      // Update stats avec les vraies données
      setStats({
        savedArticles: 0, // À connecter avec ton API de favoris
        newArticles: weekArticles.length,
        collections: 0, // À connecter avec ton API de collections
        readingList: total
      });

      // Pour les recommandations, utilise les articles les plus cités pour l'instant
      const sortedByCitations = [...articles].sort((a, b) => 
        (b.citations || 0) - (a.citations || 0)
      );
      setRecommendedArticles(sortedByCitations.slice(0, 5));

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.email || 'Hana'}!
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your research today
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.savedArticles}
          </h3>
          <p className="text-gray-600">Saved Articles</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className="text-sm text-gray-500">This week</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.newArticles}
          </h3>
          <p className="text-gray-600">New Articles</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-8 w-8 text-yellow-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.collections}
          </h3>
          <p className="text-gray-600">Collections</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <span className="text-sm text-gray-500">Recent</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {stats.readingList}
          </h3>
          <p className="text-gray-600">Reading List</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Articles</h2>
            <Link 
              to="/articles" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          
          {recentArticles.length > 0 ? (
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600">
                    <Link to={`/articles/${article.id}`}>
                      {truncate(article.title, 100)}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {article.authors.slice(0, 3).join(', ')}
                    {article.authors.length > 3 && ' et al.'}
                  </p>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {truncate(article.abstract, 150)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {article.tags?.slice(0, 2).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>📅 {formatDate(article.publishedDate)}</span>
                      {article.url && (
                        <a 
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No articles yet. Start exploring!</p>
              <Link 
                to="/articles"
                className="inline-block mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Browse Articles
              </Link>
            </div>
          )}
        </div>

        {/* Recommended for You */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
            <Link 
              to="/articles?sort=citations" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          
          {recommendedArticles.length > 0 ? (
            <div className="space-y-4">
              {recommendedArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600">
                    <Link to={`/articles/${article.id}`}>
                      {truncate(article.title, 100)}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {article.authors.slice(0, 3).join(', ')}
                    {article.authors.length > 3 && ' et al.'}
                  </p>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {truncate(article.abstract, 150)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {article.citations > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                          📊 {article.citations} citations
                        </span>
                      )}
                      {article.tags?.slice(0, 1).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      📅 {formatDate(article.publishedDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Recommendations will appear here</p>
              <p className="text-sm mt-2">Based on your interests and saved articles</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/articles"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition group"
          >
            <BookOpen className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Browse Articles</span>
          </Link>
          
          <Link
            to="/search"
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition group"
          >
            <TrendingUp className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Advanced Search</span>
          </Link>
          
          <Link
            to="/collections"
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition group"
          >
            <Star className="h-8 w-8 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">My Collections</span>
          </Link>
          
          <button
            onClick={fetchDashboardData}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition group"
          >
            <Clock className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-gray-700">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;