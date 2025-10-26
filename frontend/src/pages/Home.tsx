import { Link } from 'react-router-dom';
import { BookOpen, Search, TrendingUp, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-primary-600">ScholarFlow</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your intelligent academic article aggregator. Discover, organize, and stay updated 
          with the latest research in your field.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Search className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Smart Search</h3>
          <p className="text-gray-600">
            Find relevant articles quickly with our intelligent search engine
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Multiple Sources</h3>
          <p className="text-gray-600">
            Aggregates from ArXiv, PubMed, CrossRef, and more
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <TrendingUp className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
          <p className="text-gray-600">
            Get article suggestions based on your research interests
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Organize & Share</h3>
          <p className="text-gray-600">
            Create collections and collaborate with other researchers
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to streamline your research?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of researchers using ScholarFlow
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default Home;