import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, BookOpen, ExternalLink, FileText, X } from 'lucide-react';
import axios from 'axios';

interface Article {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publication_date: string;
  citations_count: number;
  pdf_url: string;
  external_url: string;
  research_fields: string[];
  is_open_access: boolean;
}

const AVAILABLE_FIELDS = [
  'cs.LG', // Machine Learning
  'cs.AI', // Artificial Intelligence
  'cs.CV', // Computer Vision
  'cs.CL', // Computation and Language (NLP)
  'cs.NE', // Neural and Evolutionary Computing
  'stat.ML', // Machine Learning (Statistics)
  'cs.RO', // Robotics
  'q-bio', // Quantitative Biology
  'physics', // Physics
  'math', // Mathematics
];

const FIELD_LABELS: Record<string, string> = {
  'cs.LG': 'Machine Learning',
  'cs.AI': 'Artificial Intelligence',
  'cs.CV': 'Computer Vision',
  'cs.CL': 'Natural Language Processing',
  'cs.NE': 'Neural Computing',
  'stat.ML': 'Statistical ML',
  'cs.RO': 'Robotics',
  'q-bio': 'Biology',
  'physics': 'Physics',
  'math': 'Mathematics',
};

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  useEffect(() => {
    fetchArticles();
  }, [page, selectedFields]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/v1/articles', {
        params: {
          search: searchQuery || undefined,
          page,
          limit: 20,
        },
      });

      if (response.data.success) {
        let filteredArticles = response.data.data.articles;
        
        // Filter by selected research fields
        if (selectedFields.length > 0) {
          filteredArticles = filteredArticles.filter((article: Article) =>
            article.research_fields?.some(field =>
              selectedFields.some(selected => field.toLowerCase().includes(selected.toLowerCase()))
            )
          );
        }
        
        setArticles(filteredArticles);
        setTotal(response.data.data.total);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedFields([]);
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Articles</h1>
          <p className="text-gray-600 mt-1">
            {total.toLocaleString()} articles indexed
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, abstract, or keywords..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
        >
          <Filter className="h-5 w-5" />
          Filters
          {selectedFields.length > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {selectedFields.length}
            </span>
          )}
        </button>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filter by Research Field</h3>
            {selectedFields.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {AVAILABLE_FIELDS.map((field) => (
              <button
                key={field}
                onClick={() => toggleField(field)}
                className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                  selectedFields.includes(field)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {FIELD_LABELS[field] || field}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {selectedFields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFields.map((field) => (
            <span
              key={field}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {FIELD_LABELS[field] || field}
              <button
                onClick={() => toggleField(field)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Articles List */}
          <div className="space-y-4">
            {articles.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600">
                  {selectedFields.length > 0
                    ? 'Try removing some filters or search for different terms'
                    : 'Try adjusting your search or run the scraper to import articles'}
                </p>
              </div>
            ) : (
              articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                        {article.title}
                      </h3>

                      {/* Authors */}
                      <p className="text-sm text-gray-600 mb-3">
                        {article.authors.slice(0, 3).join(', ')}
                        {article.authors.length > 3 && ` +${article.authors.length - 3} more`}
                      </p>

                      {/* Abstract */}
                      <p className="text-gray-700 line-clamp-3 mb-4">
                        {article.abstract}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.research_fields?.slice(0, 3).map((field, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                          >
                            {FIELD_LABELS[field] || field}
                          </span>
                        ))}
                        {article.is_open_access && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Open Access
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(article.publication_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{article.citations_count} citations</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {article.pdf_url && (
                        <a
                          href={article.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          <FileText className="h-4 w-4" />
                          PDF
                        </a>
                      )}
                      {article.external_url && (
                        <a
                          href={article.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {articles.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Articles;