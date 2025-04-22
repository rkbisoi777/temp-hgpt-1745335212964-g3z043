import { useEffect, useState } from 'react';
import { Compass, Upload, AlertCircle, X, Lock } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useModal } from '../components/LoginModalContext';
import { useAuthStore } from '../store/authStore';

interface RoomData {
    name: string;
    direction: string;
}

interface Suggestion {
    room: string;
    suggestion: string;
}

interface Issue {
    room: string;
    issue: string;
}

interface VaastuResponse {
    score: number;
    issues: Issue[];
    suggestions: Suggestion[];
}

export function VaastuAnalyzer() {
    const [rooms, setRooms] = useState<RoomData[]>([
        { name: 'Entrance', direction: 'East' },
        { name: 'Kitchen', direction: 'North-East' },
        { name: 'Master Bedroom', direction: 'South-West' },
        { name: 'Living Room', direction: 'Center' },
    ]);
    const [result, setResult] = useState<VaastuResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { openLoginModal } = useModal();
    const { user } = useAuthStore();

    useEffect(() => {
        if (user) {
            setIsLoggedIn(true)
        }
    }, []);

    const directions = [
        'North', 'North-East', 'East', 'South-East',
        'South', 'South-West', 'West', 'North-West', 'Center'
    ];

    const handleDirectionChange = (index: number, direction: string) => {
        const newRooms = [...rooms];
        newRooms[index] = { ...newRooms[index], direction };
        setRooms(newRooms);
    };

    const addRoom = () => {
        setRooms([...rooms, { name: '', direction: 'North' }]);
    };

    const removeRoom = (index: number) => {
        setRooms(rooms.filter((_, i) => i !== index));
    };

    const handleNameChange = (index: number, name: string) => {
        const newRooms = [...rooms];
        newRooms[index] = { ...newRooms[index], name };
        setRooms(newRooms);
    };

    // Helper function to normalize API response
    const normalizeApiResponse = (response: any): VaastuResponse => {
        let normalizedIssues: Issue[] = [];
        if (Array.isArray(response.issues)) {
            normalizedIssues = response.issues.map((issue: any) => {
                if (typeof issue === 'object' && issue !== null) {
                    return {
                        room: issue.room || '',
                        issue: issue.issue || issue.problem || ''
                    };
                }
                // Fallback for string issues (should be avoided in the prompt)
                return { room: 'General', issue: String(issue) };
            });
        }

        let normalizedSuggestions: Suggestion[] = [];
        if (Array.isArray(response.suggestions)) {
            normalizedSuggestions = response.suggestions.map((suggestion: any) => {
                if (typeof suggestion === 'object' && suggestion !== null) {
                    return {
                        room: suggestion.room || '',
                        suggestion: suggestion.suggestion || ''
                    };
                }
                // Fallback for string suggestions (should be avoided in the prompt)
                return { room: 'General', suggestion: String(suggestion) };
            });
        }

        return {
            score: typeof response.score === 'number' ? response.score : 0,
            issues: normalizedIssues,
            suggestions: normalizedSuggestions
        };
    };

    const analyzeVaastu = async () => {
        if (!isLoggedIn || !user) {
            openLoginModal();
            return;
        }

        setIsLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            const roomsList = rooms
                .map(room => `- ${room.name}: ${room.direction}`)
                .join('\n');

            const prompt = `
    Analyze this property layout according to Vaastu principles:
    ${roomsList}
    
    Based on Vaastu principles, evaluate each room's placement.
    Return a structured JSON response with exactly this format:
    {
      "score": [0-100 numerical score],
      "issues": [
        {
          "room": "Room name",
          "issue": "Detailed description of the issue"
        },
        ...
      ],
      "suggestions": [
        {
          "room": "Room name",
          "suggestion": "Detailed suggestion for improvement"
        },
        ...
      ]
    }
    
    Keep all properties exactly as shown, with arrays of objects for issues and suggestions.
    Each issue and suggestion must include the room name and detailed text.
    `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Remove Markdown code block markers if they exist
            const cleaned = text.replace(/```json|```/g, '').trim();

            try {
                const rawResponse = JSON.parse(cleaned);
                console.log('API response:', rawResponse);
                const normalizedResponse = normalizeApiResponse(rawResponse);
                setResult(normalizedResponse);
                setShowPopup(true);
            } catch (parseError) {
                console.error('Error parsing API response:', parseError);
                alert('Failed to parse analysis results. Please try again.');
            }
        } catch (error) {
            console.error('Error analyzing Vaastu:', error);
            alert('Failed to analyze Vaastu. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex flex-row justify-center gap-2 mb-6">
                <Compass className="w-6 h-6 text-blue-500 mt-1" />
                <h2 className="text-2xl font-bold">Vaastu Analyzer</h2>
            </div>

            <div className="grid gap-8">
                <div className="space-y-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Room Configuration</h3>

                        {rooms.map((room, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 mb-3">
                                <input
                                    type="text"
                                    value={room.name}
                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                    placeholder="Room name"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                                <div className="flex flex-row justify-between">
                                    <select
                                        value={room.direction}
                                        onChange={(e) => handleDirectionChange(index, e.target.value)}
                                        className="w-full sm:w-auto px-3 py-2 border rounded-lg"
                                    >
                                        {directions.map((dir) => (
                                            <option key={dir} value={dir}>
                                                {dir}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeRoom(index)}
                                        className="sm:w-auto px-3 py-2 text-red-500 ml-1.5 text-xl bg-red-100 hover:bg-red-50 rounded-lg"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center">
                            <button
                                onClick={addRoom}
                                className="mt-2 px-4 py-2 text-blue-500 border border-blue-500 rounded-lg hover:bg-blue-50"
                            >
                                Add Room
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4">Floor Plan (Optional)</h3>
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">
                                Upload floor plan image (Coming soon)
                            </p>
                        </div>
                    </div>

                    {/* <button
                        onClick={analyzeVaastu}
                        disabled={isLoading || rooms.length === 0}
                        className="w-full px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? 'Analyzing...' : (
                            <>
                                {!isLoggedIn && <Lock className="w-4 h-4" />}
                                Analyze Vaastu
                            </>)}
                    </button> */}
                    <button
                        onClick={analyzeVaastu}
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Analyzing...' : (
                            <>
                                {!isLoggedIn && <Lock className="w-4 h-4" />}
                                Analyze Vaastu
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Result Popup */}
            {showPopup && result && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">Vaastu Analysis Results</h3>
                                <button
                                    onClick={closePopup}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-600">Vaastu Score</span>
                                        <span className="font-semibold text-lg">{result.score}/100</span>
                                    </div>
                                    <div className="h-3 bg-gray-200 rounded-full">
                                        <div
                                            className={`h-full rounded-full ${result.score >= 70
                                                ? 'bg-green-500'
                                                : result.score >= 40
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                                }`}
                                            style={{ width: `${result.score}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2 text-lg">Issues Identified</h4>
                                    <ul className="space-y-3">
                                        {result.issues.map((issue, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <span className="font-medium">{issue.room}: </span>
                                                    <span>{issue.issue}</span>
                                                </div>
                                            </li>
                                        ))}
                                        {result.issues.length === 0 && (
                                            <li className="text-gray-500">No issues found</li>
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2 text-lg">Suggested Remedies</h4>
                                    <ul className="space-y-3">
                                        {result.suggestions.map((suggestion, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="text-green-500 text-xl leading-5">•</span>
                                                <div>
                                                    <span className="font-medium">{suggestion.room}: </span>
                                                    <span>{suggestion.suggestion}</span>
                                                </div>
                                            </li>
                                        ))}
                                        {result.suggestions.length === 0 && (
                                            <li className="text-gray-500">No suggestions available</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closePopup}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}