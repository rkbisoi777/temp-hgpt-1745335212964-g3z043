import { useState, useEffect } from "react";
import { NewsArticle, NewsService } from "../../lib/newsService";
import { Link } from "react-router-dom";

export function NewsGrid() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await NewsService.fetchNews(10, 1);
        setArticles(news);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNews();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-lg font-medium text-gray-700">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="min-h-44 bg-white p-2 mb-4">
        <h1 className="text-lg font-bold text-blue-500 mb-2">Latest News</h1>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-4 min-w-[1000px]">
            {articles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[300px] max-w-[300px] h-[420px] bg-white border border-gray-100 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg"
              >
                <div className="flex flex-col h-full">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80";
                      }}
                    />
                  )}
                  <div className="px-4 py-3 flex flex-col flex-grow">
                    <span className="text-xs text-gray-500 mb-2">
                      {new Date(article.published_at).toLocaleString()}
                    </span>
                    <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-3">
                      {article.title}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-4">
                      {article.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <Link
            to="/news"
            className="text-sm text-right text-blue-600 hover:text-blue-800 font-medium text-sm underline"
          >
            View all news
          </Link>
        </div>
    </div>
  );
}
