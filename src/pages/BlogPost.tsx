import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService, BlogPostItem } from '../lib/blogService';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (slug) {
          const data = await blogService.getPostBySlug(slug);
          setPost(data);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-700">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg font-medium text-gray-700">Post not found</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title} | HouseGPT Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt || ''} />
        {post.meta_keywords && (
          <meta name="keywords" content={post.meta_keywords.join(', ')} />
        )}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description || post.excerpt || ''} />
        {post.featured_image && (
          <meta property="og:image" content={post.featured_image} />
        )}
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        <meta property="article:modified_time" content={post.updated_at} />
        {post.category && (
          <meta property="article:section" content={post.category} />
        )}
        {post.tags && post.tags.map(tag => (
          <meta property="article:tag" content={tag} key={tag} />
        ))}
      </Helmet>

      <article className="min-h-screen py-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/blogs" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          {post.featured_image && (
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full max-h-[500px] object-cover rounded-lg shadow-md mb-8"
            />
          )}

          <h1 className="lg:text-4xl md:text-3xl sm:text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
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

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div
            className="prose prose-lg max-w-none -mx-3"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </article>
    </>
  );
}