import { Link } from 'react-router-dom';
import { Calendar, ExternalLink, Tag } from 'lucide-react';
import { BlogPostItem } from '../../lib/blogService';

interface BlogCardProps {
  post: BlogPostItem;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to={`/blog/${post.slug}`} className="block mb-4">
      <article className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full max-h-[400px] object-cover rounded-lg shadow-md"
          />
        )}
        <div className="p-2">
          <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-3">
            {post.title}
          </h2>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.published_at || post.created_at}>
                {new Date(post.published_at || post.created_at).toLocaleDateString()}
              </time>
            </div>
            {post.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{post.category}</span>
              </div>
            )}
          </div>

          {post.excerpt && (
            <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
          )}

          <Link
            to={`/blog/${post.slug}`}
            className="flex justify-end text-blue-600 hover:text-blue-800"
          >
            <div className="flex justify-end items-center text-blue-500">
            <span className="text-sm mr-1">Read full article</span>
            <ExternalLink className="ml-1 w-4 h-4" />
          </div>
          </Link>
        </div>
      </article>
    </Link>
  );
}
