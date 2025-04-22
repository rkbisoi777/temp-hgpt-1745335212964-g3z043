import { ExternalLink } from 'lucide-react';

interface NewsCardProps {
  news: {
    title: string;
    description: string;
    image_url: string;
    url: string;
    source: string;
    published_at: string;
  };
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      {news.image_url && (
        <img
          src={news.image_url}
          alt={news.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80';
          }}
        />
      )}
      <div className="p-4">
        {/* <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 font-medium">{news.source}</span>
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div> */}
        <h2 className="text-xl font-semibold mb-2 line-clamp-2">{news.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-2">{news.description}</p>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-gray-500">
            {new Date(news.published_at).toLocaleDateString()}
          </div>
          <div className="flex justify-end items-center text-blue-500">
            <span className="text-sm font-bold mr-1">Read full article</span>
            <ExternalLink className="ml-1 w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}