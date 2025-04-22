

import { Calculator as CalculatorIcon, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Calculator() {

    const navigate = useNavigate();

  return (
        <div className="flex justify-center mb-4">
          <div className="inline-flex p-1 space-x-2">
            <button
              onClick={() => navigate('/ai-emi-calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors bg-gradient-to-r from-cyan-400 to-blue-500 text-white`}
            >
              <CalculatorIcon className="w-4 h-4" />
              <span>EMI Calculator</span>
            </button>
            <button
              onClick={() => navigate('/ai-vaastu-analyzer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors bg-gradient-to-r from-cyan-400 to-blue-500 text-white`}
            >
              <Compass className="w-4 h-4" />
              <span>Vaastu Analyzer</span>
            </button>
          </div>
        </div>
  );
}