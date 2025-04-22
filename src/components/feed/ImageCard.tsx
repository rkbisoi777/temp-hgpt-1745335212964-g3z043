interface ImageCardProps {
    image: {
      url: string;
      caption: string;
      likes: number;
    };
  }
  
  export function ImageCard({ image }: ImageCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
        <img src={image.url} alt={image.caption} className="w-full h-96 object-cover" />
        <div className="p-4">
          <p className="text-gray-700">{image.caption}</p>
          {/* <div className="mt-2 flex items-center text-gray-500">
            <i className="fas fa-heart mr-1"></i>
            <span>{image.likes}</span>
          </div> */}
        </div>
      </div>
    );
  }