import { useEffect, useState } from 'react';
import { blogService, BlogPostItem } from '../lib/blogService';
import { Link } from 'react-router-dom';
import { Calendar, Search, Filter, X, ChevronDown, ExternalLink } from 'lucide-react';

export function Blogs() {
    const [posts, setPosts] = useState<BlogPostItem[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPostItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await blogService.getAllPublishedPosts();
                setPosts(data);
                setFilteredPosts(data);

                // Extract unique categories
                const uniqueCategories = Array.from(
                    new Set(data.map(post => post.category).filter(Boolean))
                ) as string[];
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching blog posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        // Filter and sort posts whenever search term, category, or sort option changes
        let results = [...posts];

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            results = results.filter(post =>
                post.title.toLowerCase().includes(term) ||
                (post.excerpt && post.excerpt.toLowerCase().includes(term))
            );
        }

        // Apply category filter
        if (selectedCategory) {
            results = results.filter(post => post.category === selectedCategory);
        }

        // Apply sorting
        results = sortPosts(results, sortBy);

        setFilteredPosts(results);
    }, [searchTerm, selectedCategory, sortBy, posts]);

    const sortPosts = (postsToSort: BlogPostItem[], sortOption: string) => {
        switch (sortOption) {
            case 'newest':
                return [...postsToSort].sort((a, b) =>
                    new Date(b.published_at || b.created_at).getTime() -
                    new Date(a.published_at || a.created_at).getTime()
                );
            case 'oldest':
                return [...postsToSort].sort((a, b) =>
                    new Date(a.published_at || a.created_at).getTime() -
                    new Date(b.published_at || b.created_at).getTime()
                );
            case 'title':
                return [...postsToSort].sort((a, b) =>
                    a.title.localeCompare(b.title)
                );
            default:
                return postsToSort;
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSortBy('newest');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-gray-50 rounded-full flex items-center justify-start min-w-8 gap-2">
                    {['-0.3s', '-0.15s', '0s'].map((delay, index) => (
                        <div key={index} className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center p-1 animate-bounce" style={{ animationDelay: delay }}>
                            <img src="https://i.postimg.cc/cHgZjqp8/output-onlinepngtools.png" alt="HouseGPT" className="w-4 h-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="py-4 px-4 max-w-7xl mx-auto">
            <div className="w-full mx-auto">
                <div className="flex flex-col items-center mb-2">
                    <h1 className="text-xl font-bold text-blue-600 mb-2">HouseGPT Blogs</h1>
                    <p className="text-gray-600 text-sm text-center max-w-2xl">
                        Discover the latest insights, tips, and updates from our team
                    </p>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search blog posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-1 text-sm w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center justify-center px-4 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filters
                            <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'transform rotate-180' : ''}`} />
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-xs">Category</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1 text-xs">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
                                    className="w-full border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="title">Title A-Z</option>
                                </select>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results summary */}
                <div className="mb-4 text-sm text-gray-600">
                    Showing {filteredPosts.length} of {posts.length} posts
                    {searchTerm && <span> matching "{searchTerm}"</span>}
                    {selectedCategory && <span> in {selectedCategory}</span>}
                </div>

                {/* Blog posts grid */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <Link
                                key={post.id}
                                to={`/blog/${post.slug}`}
                                className="group"
                            >
                                <article className="h-full flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                    <div className="relative h-48 overflow-hidden mt-2">
                                        {post.featured_image ? (
                                            <img
                                                src={post.featured_image}
                                                alt={post.title}
                                                className="w-full h-full rounded object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                        {post.category && (
                                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                                {post.category}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow flex flex-col">

                                        <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                                            {post.title}
                                        </h2>

                                        {post.excerpt && (
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className='flex flex-row justify-between'>

                                            <div className="flex items-center text-xs text-gray-500 mb-2 mt-2">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                <time dateTime={post.published_at || post.created_at}>
                                                    {new Date(post.published_at || post.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </time>
                                            </div>

                                            <div className="flex justify-end items-center text-blue-500">
                                                <span className="text-sm mr-1">Read full article</span>
                                                <ExternalLink className="ml-1 w-4 h-4" />
                                            </div>
                                        </div>

                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 bg-white rounded-lg border border-gray-200 flex flex-col items-center justify-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}