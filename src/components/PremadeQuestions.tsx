import { MessageCircle } from 'lucide-react';

interface PremadeQuestionsProps {
  onQuestionClick: (question: string) => void;
  location?: string; // New prop for location
}

export function PremadeQuestions({ onQuestionClick, location = 'Mumbai' }: PremadeQuestionsProps) {
  // Base questions that will be modified based on location
  const getQuestions = (loc: string) => [
    { text: `2 BHK in ${loc}`, icon: "🏠" },
    { text: "Things to Know before buying a house", icon: "📝" },
    { text: "What is RERA?", icon: "📋" },
    { text: `Best areas to invest in ${loc}`, icon: "💰" },
    { text: `Luxury apartments in ${loc}`, icon: "🏢" },
    { text: "How to check property legal documents", icon: "📜" },
    { text: "Tips for first-time homebuyers", icon: "💡" },
    { text: `Upcoming residential projects in ${loc}`, icon: "🚧" },
    { text: "How to apply for a home loan", icon: "🏦" },
    { text: "Understanding property taxes", icon: "💵" },
    { text: "Benefits of buying a pre-owned house", icon: "🏠" },
    { text: `Cost of living in ${loc}`, icon: "📊" },
    { text: `Investing in commercial spaces in ${loc}`, icon: "🏬" },
    { text: "How to negotiate property prices", icon: "🤔" },
    { text: loc === 'Mumbai' ? `Seaside homes in ${loc}` : `Premium homes in ${loc}`, icon: "🌊" },
    { text: "Why choose RERA-registered projects", icon: "✅" },
    { text: `Popular housing societies in ${loc}`, icon: "🏘️" },
    { text: "Understanding stamp duty and registration", icon: "🖋️" },
    { text: `Pet-friendly apartments in ${loc}`, icon: "🐾" },
    { text: "Tips to avoid real estate scams", icon: "🚨" },
    { text: "Eco-friendly housing options", icon: "🌱" },
    { text: `Top gated communities in ${loc}`, icon: "🔒" }
  ];

  const questions = getQuestions(location);

  return (
    <div className="mt-4 z-48">
      <div className="flex items-center gap-1 mb-2 text-gray-600">
        <MessageCircle className="w-4 h-4" />
        <span className="text-sm font-semibold">Popular Questions</span>
      </div>

      <div className="relative overflow-x-auto overflow-y-hidden scrollbar-hide-mobile pb-1">
        <div className="flex flex-col gap-2 z-48">
          {/* First row */}
          <div className="flex gap-2">
            {questions.filter((_, index) => index % 3 === 0).map(({ text, icon }) => (
              <button
                key={text}
                onClick={() => onQuestionClick(text)}
                className="inline-flex items-center gap-1 px-2 py-1.5 bg-white rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-sm text-xs"
                style={{ width: "fit-content" }}
              >
                <span>{icon}</span>
                <span className="truncate">{text}</span>
              </button>
            ))}
          </div>
          {/* Second row */}
          <div className="flex gap-2">
            {questions.filter((_, index) => index % 3 === 1).map(({ text, icon }) => (
              <button
                key={text}
                onClick={() => onQuestionClick(text)}
                className="inline-flex items-center gap-1 px-2 py-1.5 bg-white rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-sm text-xs"
                style={{ width: "fit-content" }}
              >
                <span>{icon}</span>
                <span className="truncate">{text}</span>
              </button>
            ))}
          </div>
          {/* Third row */}
          <div className="flex gap-2">
            {questions.filter((_, index) => index % 3 === 2).map(({ text, icon }) => (
              <button
                key={text}
                onClick={() => onQuestionClick(text)}
                className="inline-flex items-center gap-1 px-2 py-1.5 bg-white rounded-full border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors shadow-sm text-xs"
                style={{ width: "fit-content" }}
              >
                <span>{icon}</span>
                <span className="truncate">{text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}