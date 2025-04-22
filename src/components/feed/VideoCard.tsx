interface VideoCardProps {
    video: {
      url: string;
      thumbnail: string;
      title: string;
      duration: string;
    };
  }
  
  export function VideoCard({ video }: VideoCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <div className="relative">
          <img src={video.thumbnail} alt={video.title} className="w-full h-64 object-cover" />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
            {video.duration}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <i className="fas fa-play text-white text-2xl"></i>
            </div>
          </div>
        </div>
        {/* <div className="p-4">
          <h3 className="font-semibold text-lg">{video.title}</h3>
        </div> */}
      </div>
    );
  }