import { useState, useEffect } from "react";
import { NewsService, NewsArticle } from "../lib/newsService";
import { ExternalLink } from "lucide-react";

export function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const news = await NewsService.fetchNews(20, 1);
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
    <div className="min-h-screen bg-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* <h1 className="text-xl font-bold text-gray-800 mb-4 items-center text-center justify-between flex">Latest News</h1> */}
        
        <div className="space-y-6">
          {articles.map((article) => (
            <div 
              key={article.id}
              className="bg-white border border-gray-100 rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg"
            >
              <div className="md:flex">
                {article.image_url && (
                  <div className="md:w-1/3 flex-shrink-0">
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8&auto=format&fit=crop&w=1073&q=80";
                      }}
                    />
                  </div>
                )}
               
                <div className="px-4 py-2 md:w-2/3">
                <div className="flex justify-start mb-2 text-gray-500 text-sm">
                    <span>{new Date(article.published_at).toLocaleString()}</span>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h2>
                    
                  </a>
                  <p className="mt-3 text-gray-600 line-clamp-2">{article.description}</p>
                  <div className="flex justify-end items-center mt-1 text-blue-500 py-2">
                      <span className="text-sm">Read full article</span>
                      <ExternalLink className="ml-1 w-4 h-4" />
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}