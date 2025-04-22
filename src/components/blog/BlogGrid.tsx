import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';
import { BlogPostItem, blogService } from '../../lib/blogService';

export function BlogGrid() {
    const [posts, setPosts] = useState<BlogPostItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await blogService.getAllPublishedPosts();
                setPosts(data);
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-44 bg-gray-50 flex items-center justify-center">
                <div className="text-lg font-medium text-gray-700">Loading posts...</div>
            </div>
        );
    }

    return (
        <div className="py-2 px-2 mt-4">
            <h1 className="text-lg font-bold text-blue-500 mb-2">Latest Blogs</h1>
            <div className="w-full mx-auto">
                <div className="overflow-x-auto">
                    <div className="flex space-x-4 pb-2 min-w-[1000px]">
                        {/* {posts.slice(0, 4).map((post) => ( */}
                        {posts.slice(0, 10).map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="min-w-[250px] max-w-[300px] h-[390px] flex-shrink-0 bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
                            >
                                <article className="flex flex-col">
                                    {post.featured_image && (
                                        <img
                                            src={post.featured_image}
                                            alt={post.title}
                                            className="w-full h-44 object-cover rounded-t-lg"
                                        />
                                    )}
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                                                {post.title}
                                            </h2>

                                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <time dateTime={post.published_at || post.created_at}>
                                                        {new Date(post.published_at || post.created_at).toLocaleDateString()}
                                                    </time>
                                                </div>
                                                {post.category && (
                                                    <div className="flex items-center gap-1">
                                                        <Tag className="w-4 h-4" />
                                                        <span>{post.category}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {post.excerpt && (
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{post.excerpt}</p>
                                            )}
                                        </div>

                                        <Link
                                            to={`/blog/${post.slug}`}
                                            className="inline-flex justify-end items-center text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Read more
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end mt-2">
                    <Link
                        to="/blogs"
                        className="text-sm text-right text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                    >
                        View all blogs
                    </Link>
                </div>
            </div>
        </div>
    );
}
