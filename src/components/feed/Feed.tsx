// import { useEffect, useState } from 'react';
// import { FeedItem, FeedItemType } from './FeedItem';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { propertyService } from '../../lib/propertyService';
// import { NewsService } from '../../lib/newsService';

// interface FeedItem {
//   id: string;
//   type: FeedItemType;
//   data: any;
// }

// interface FeedProps{
//   location: string;
// }

// export function Feed({ location }: FeedProps) {
//   const [items, setItems] = useState<FeedItem[]>([]);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   const fetchMoreData = async () => {
//     try {
//       // Fetch properties
//       const properties = await propertyService.searchLocationProperties(location);
//       const news = await NewsService.fetchNews(10, page);

//       // Create sample data for other types
//       const newItems: FeedItem[] = [
//         // Properties
//         ...properties.map(property => ({
//           id: `property-${property.id}`,
//           type: 'property' as FeedItemType,
//           data: property
//         })),

//         // News
//         ...news.map(newsItem => ({
//           id: `news-${newsItem.id}`,
//           type: 'news' as FeedItemType,
//           data: newsItem
//         })),

//         // Sample image posts
//         {
//           id: `image-${Date.now()}`,
//           type: 'image',
//           data: {
//             url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
//             caption: 'Beautiful modern home interior',
//             likes: 156
//           }
//         },

//         // Sample video post
//         {
//           id: `video-${Date.now()}`,
//           type: 'video',
//           data: {
//             url: 'https://example.com/video.mp4',
//             thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
//             title: 'Virtual Property Tour',
//             duration: '2:15'
//           }
//         },

//         // Sample info post
//         {
//           id: `info-${Date.now()}`,
//           type: 'info',
//           data: {
//             title: 'Property Market Update',
//             content: 'Latest trends show increasing demand in suburban areas...',
//             icon: 'fa-chart-line'
//           }
//         },

//         // Sample offer post
//         {
//           id: `offer-${Date.now()}`,
//           type: 'offer',
//           data: {
//             title: 'Special Discount',
//             description: 'Get 10% off on your first property booking',
//             validUntil: '2025-03-31',
//             discount: '10% OFF',
//             code: 'FIRST10'
//           }
//         },

//         // Property grid
//         {
//           id: `grid-${Date.now()}`,
//           type: 'propertyGrid',
//           data: properties.slice(0, 4).map(p => p.id)
//         }
//       ];

//       // Shuffle the items randomly
//       const shuffledItems = newItems.sort(() => Math.random() - 0.5);

//       setItems(prev => [...prev, ...shuffledItems]);
//       setPage(prev => prev + 1);
//       setHasMore(shuffledItems.length > 0);
//     } catch (error) {
//       console.error('Error fetching feed items:', error);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMoreData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto py-4">
//       <InfiniteScroll
//         dataLength={items.length}
//         next={fetchMoreData}
//         hasMore={hasMore}
//         loader={
//           <div className="text-center py-4">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//           </div>
//         }
//         endMessage={
//           <div className="text-center py-4 text-gray-500">
//             No more items to load
//           </div>
//         }
//       >
//         {items.map((item) => (
//           <FeedItem key={item.id} type={item.type} data={item.data} />
//         ))}
//       </InfiniteScroll>
//     </div>
//   );
// }

import { useEffect, useRef, useState } from 'react';
import { FeedItem, FeedItemType } from './FeedItem';
import { propertyService } from '../../lib/propertyService';
import { NewsService } from '../../lib/newsService';
import { blogService } from '../../lib/blogService';

interface FeedItemData {
  id: string;
  type: FeedItemType;
  data: any;
}

interface FeedProps {
  location: string;
}

export function Feed({ location }: FeedProps) {
  const [items, setItems] = useState<FeedItemData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [visibleIndexes, setVisibleIndexes] = useState<[number, number]>([0, 5]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fetchMoreData = async () => {
    try {
      const properties = await propertyService.searchLocationProperties(location);
      const news = await NewsService.fetchNews(10, page);
      const blogs = await blogService.getAllPublishedPosts();

      const newItems: FeedItemData[] = [
        ...blogs.map(blog => ({
          id: `blog-${blog.id}`,
          type: 'blog' as FeedItemType,
          data: blog,
        })),
        ...properties.map(property => ({
          id: `property-${property.id}`,
          type: 'property' as FeedItemType,
          data: property,
        })),
        ...news.map(newsItem => ({
          id: `news-${newsItem.id}`,
          type: 'news' as FeedItemType,
          data: newsItem,
        })),
        {
          id: `image-${Date.now()}`,
          type: 'image',
          data: {
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
            caption: 'Beautiful modern home interior',
            likes: 156,
          },
        },
        {
          id: `video-${Date.now()}`,
          type: 'video',
          data: {
            url: 'https://example.com/video.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
            title: 'Virtual Property Tour',
            duration: '2:15',
          },
        },
        {
          id: `info-${Date.now()}`,
          type: 'info',
          data: {
            title: 'Property Market Update',
            content: 'Latest trends show increasing demand in suburban areas...',
            icon: 'fa-chart-line',
          },
        },
        {
          id: `offer-${Date.now()}`,
          type: 'offer',
          data: {
            title: 'Special Discount',
            description: 'Get 10% off on your first property booking',
            validUntil: '2025-03-31',
            discount: '10% OFF',
            code: 'FIRST10',
          },
        },
        {
          id: `grid-${Date.now()}`,
          type: 'propertyGrid',
          data: properties.slice(0, 4).map(p => p.id),
        },
      ];

      const shuffledItems = newItems.sort(() => Math.random() - 0.5);

      setItems(prev => [...prev, ...shuffledItems]);
      setPage(prev => prev + 1);
      setHasMore(shuffledItems.length > 0);
    } catch (error) {
      console.error('Error fetching feed items:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoreData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      let startIndex = 0;
      let endIndex = 0;

      for (let i = 0; i < itemRefs.current.length; i++) {
        const el = itemRefs.current[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top;
          const bottom = rect.bottom;

          if (bottom >= 0 && top <= viewportHeight) {
            startIndex = Math.max(0, i - 1); // preload 1 before
            endIndex = Math.min(items.length, i + 3); // preload 2 after
            break;
          }
        }
      }

      setVisibleIndexes([startIndex, endIndex]);

      // Trigger fetch when user reaches end
      if (
        window.innerHeight + scrollY >=
          document.documentElement.scrollHeight - 200 &&
        hasMore
      ) {
        fetchMoreData();
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [items, hasMore]);

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4" ref={containerRef}>
      {items.map((item, index) => {
        const [start, end] = visibleIndexes;
        const isVisible = index >= start && index <= end;

        return (
          <div
            key={item.id}
            ref={el => (itemRefs.current[index] = el)}
          >
            {isVisible ? <FeedItem type={item.type} data={item.data} /> : null}
          </div>
        );
      })}
      {!hasMore && (
        <div className="text-center py-4 text-gray-500">No more items to load</div>
      )}
    </div>
  );
}
