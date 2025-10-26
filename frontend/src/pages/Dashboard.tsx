import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { BookOpen, TrendingUp, Star, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.email}!
        </h1>
        <p className="text-primary-100">
          Here's what's happening with your research today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
          <p className="text-gray-600">Saved Articles</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className="text-sm text-gray-500">This week</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
          <p className="text-gray-600">New Articles</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Star className="h-8 w-8 text-yellow-600" />
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
          <p className="text-gray-600">Collections</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <span className="text-sm text-gray-500">Recent</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">0</h3>
          <p className="text-gray-600">Reading List</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Articles</h2>
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No articles yet. Start exploring!</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended for You</h2>
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Recommendations will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;