interface InfoCardProps {
    info: {
      title: string;
      content: string;
      icon: string;
    };
  }
  
  export function InfoCard({ info }: InfoCardProps) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
            <i className={`fas ${info.icon}`}></i>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
            <p className="text-gray-600">{info.content}</p>
          </div>
        </div>
      </div>
    );
  }