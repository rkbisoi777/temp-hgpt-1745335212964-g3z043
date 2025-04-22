import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calculator, Info, AlertCircle, X, Lock } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useModal } from '../components/LoginModalContext';
import { useAuthStore } from '../store/authStore';

interface EMIFormData {
    propertyPrice: number;
    downPayment: number;
    loanTenure: number;
    interestRate: number;
    monthlyIncome: number;
    age: number;
    liabilities: number;
}

interface EMIResponse {
    emi: number;
    optimalTenure: number;
    optimalDownPayment: number;
    score: number;
    suggestion: string;
    breakdown: {
        year: number;
        principal: number;
        interest: number;
    }[];
}

interface SliderProps {
    name: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    label: string;
    unit: string;
    formatValue?: (value: number) => string;
}

const SliderInput = ({ name, value, onChange, min, max, step, label, unit, formatValue }: SliderProps) => {
    const displayValue = formatValue ? formatValue(value) : value.toString();
    
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <span className="text-sm font-semibold">{displayValue} {unit}</span>
            </div>
            <input
                type="range"
                name={name}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                min={min}
                max={max}
                step={step}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatValue ? formatValue(min) : min} {unit}</span>
                <span>{formatValue ? formatValue(max) : max} {unit}</span>
            </div>
        </div>
    );
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
};

export function EMICalculator() {
    const [formData, setFormData] = useState<EMIFormData>({
        propertyPrice: 5000000,
        downPayment: 1000000,
        loanTenure: 20,
        interestRate: 8.5,
        monthlyIncome: 100000,
        age: 30,
        liabilities: 0,
    });

    const [currentEMI, setCurrentEMI] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loanToValueRatio, setLoanToValueRatio] = useState(0);
    const [result, setResult] = useState<EMIResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { openLoginModal } = useModal();
    const { user } = useAuthStore();

    useEffect(() => {
        if(user){
            setIsLoggedIn(true)
        }
    }, []);

    // Calculate EMI in real-time when form values change
    useEffect(() => {
        calculateBasicEMI();
    }, [formData]);

    const calculateBasicEMI = () => {
        const loanAmount = formData.propertyPrice - formData.downPayment;
        const monthlyRate = formData.interestRate / 1200; // Convert annual percentage to monthly decimal
        const totalMonths = formData.loanTenure * 12;
        
        // EMI calculation formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
        const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        const totalPayment = emi * totalMonths;
        const totalInterestAmount = totalPayment - loanAmount;
        const ltv = (loanAmount / formData.propertyPrice) * 100;
        
        setCurrentEMI(emi);
        setTotalInterest(totalInterestAmount);
        setTotalAmount(totalPayment);
        setLoanToValueRatio(ltv);
    };

    const handleSliderChange = (name: keyof EMIFormData, value: number) => {
        // Special handling for downPayment to ensure it's not more than propertyPrice
        if (name === 'downPayment' && value > formData.propertyPrice) {
            value = formData.propertyPrice;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper function to normalize API response
    const normalizeResponse = (rawResponse: any): EMIResponse => {
        // Default values in case the API returns incomplete data
        const defaultResponse: EMIResponse = {
            emi: currentEMI,
            optimalTenure: formData.loanTenure,
            optimalDownPayment: formData.downPayment,
            score: 0,
            suggestion: "Unable to generate suggestion.",
            breakdown: []
        };
        
        // Extract values from the API response, use defaults if missing
        const normalizedResponse: EMIResponse = {
            emi: typeof rawResponse.emi === 'number' ? rawResponse.emi : defaultResponse.emi,
            optimalTenure: typeof rawResponse.optimalTenure === 'number' ? rawResponse.optimalTenure : defaultResponse.optimalTenure,
            optimalDownPayment: typeof rawResponse.optimalDownPayment === 'number' ? rawResponse.optimalDownPayment : defaultResponse.optimalDownPayment,
            score: typeof rawResponse.score === 'number' ? rawResponse.score : defaultResponse.score,
            suggestion: typeof rawResponse.suggestion === 'string' ? rawResponse.suggestion : defaultResponse.suggestion,
            breakdown: defaultResponse.breakdown // Will be generated separately
        };
        
        return normalizedResponse;
    };

    const generateAIInsight = async () => {
        if (!isLoggedIn || !user) {
            openLoginModal();
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            const prompt = `
                Calculate home loan details for a property worth ₹${formData.propertyPrice} based on these parameters:
                - Monthly income: ₹${formData.monthlyIncome}
                - Age: ${formData.age} years
                - Existing monthly liabilities: ₹${formData.liabilities}
                - Preferred loan tenure: ${formData.loanTenure} years
                - Down payment: ₹${formData.downPayment}
                - Interest rate: ${formData.interestRate}%

                Return a JSON object with EXACTLY these fields:
                {
                  "emi": (calculated monthly EMI as a number),
                  "optimalTenure": (recommended loan tenure in years as a number),
                  "optimalDownPayment": (recommended down payment amount as a number),
                  "score": (affordability score from 0-100 as a number),
                  "suggestion": (financial advice as a string)
                }

                Ensure all number values are returned as actual numbers, not strings.
                Do not include any explanations or text outside the JSON structure.
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text();
            
            // Remove Markdown code block markers if they exist
            const cleaned = text.replace(/```json|```/g, '').trim();
            
            try {
                const rawResponse = JSON.parse(cleaned);
                console.log('API response:', rawResponse);
                
                // Normalize the response to ensure it matches our expected format
                const normalizedResponse = normalizeResponse(rawResponse);
                
                // Generate EMI breakdown data
                const loanAmount = formData.propertyPrice - formData.downPayment;
                const monthlyRate = formData.interestRate / 12 / 100;
                const totalMonths = formData.loanTenure * 12;
                const monthlyEMI = normalizedResponse.emi;
                
                // Calculate breakdown by year
                const breakdown = Array.from({ length: formData.loanTenure }, (_, i) => {
                    const year = i + 1;
                    
                    // Calculate cumulative values up to this year
                    let remainingPrincipal = loanAmount;
                    let totalInterest = 0;
                    let principalPaid = 0;
                    
                    // Process each month up to current year
                    for (let month = 1; month <= year * 12; month++) {
                        if (month > totalMonths) break;
                        
                        const interestForMonth = remainingPrincipal * monthlyRate;
                        const principalForMonth = monthlyEMI - interestForMonth;
                        
                        totalInterest += interestForMonth;
                        principalPaid += principalForMonth;
                        remainingPrincipal -= principalForMonth;
                    }
                    
                    return {
                        year,
                        principal: principalPaid,
                        interest: totalInterest,
                    };
                });
                
                setResult({ ...normalizedResponse, breakdown });
                setShowPopup(true);
                
            } catch (parseError) {
                console.error('Error parsing API response:', parseError);
                setError('Failed to parse calculation results. Please try again.');
            }
        } catch (error) {
            console.error('Error calculating EMI:', error);
            setError('Failed to generate AI insights. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="mx-auto max-w-xl bg-white p-4 rounded-lg">
            <div className="flex flex-row justify-center items-center gap-2 mb-4">
                <Calculator className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold">EMI Calculator</h2>
            </div>

            {/* Summary Card at the Top */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm text-gray-600">Monthly EMI</div>
                        <div className="text-xl font-bold text-blue-600">{formatCurrency(Math.round(currentEMI))}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Total Interest</div>
                        <div className="text-xl font-bold text-blue-600">{formatCurrency(Math.round(totalInterest))}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-xl font-bold text-blue-600">{formatCurrency(Math.round(totalAmount))}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Loan to Value</div>
                        <div className="text-xl font-bold text-blue-600">{Math.round(loanToValueRatio)}%</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 max-w-xl">
                {/* Sliders instead of text inputs */}
                <SliderInput
                    name="propertyPrice"
                    value={formData.propertyPrice}
                    onChange={(value) => handleSliderChange('propertyPrice', value)}
                    min={500000}
                    max={50000000}
                    step={100000}
                    label="Property Price"
                    unit=""
                    formatValue={(value) => formatCurrency(value)}
                />

                <SliderInput
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={(value) => handleSliderChange('downPayment', value)}
                    min={100000}
                    max={formData.propertyPrice}
                    step={50000}
                    label="Down Payment"
                    unit=""
                    formatValue={(value) => formatCurrency(value)}
                />

                <SliderInput
                    name="loanTenure"
                    value={formData.loanTenure}
                    onChange={(value) => handleSliderChange('loanTenure', value)}
                    min={1}
                    max={30}
                    step={1}
                    label="Loan Tenure"
                    unit="years"
                />

                <SliderInput
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={(value) => handleSliderChange('interestRate', value)}
                    min={5}
                    max={15}
                    step={0.1}
                    label="Interest Rate"
                    unit="%"
                />

                <SliderInput
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={(value) => handleSliderChange('monthlyIncome', value)}
                    min={25000}
                    max={1000000}
                    step={5000}
                    label="Monthly Income"
                    unit=""
                    formatValue={(value) => formatCurrency(value)}
                />

                <SliderInput
                    name="age"
                    value={formData.age}
                    onChange={(value) => handleSliderChange('age', value)}
                    min={18}
                    max={70}
                    step={1}
                    label="Age"
                    unit="years"
                />

                <SliderInput
                    name="liabilities"
                    value={formData.liabilities}
                    onChange={(value) => handleSliderChange('liabilities', value)}
                    min={0}
                    max={500000}
                    step={1000}
                    label="Monthly Liabilities"
                    unit=""
                    formatValue={(value) => formatCurrency(value)}
                />

                <button
                    onClick={generateAIInsight}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isLoading ? 'Generating...' : (
                        <>
                            {!isLoggedIn && <Lock className="w-4 h-4" />}
                            Generate AI Insight
                        </>
                    )}
                </button>

                <div className="text-xs text-center text-gray-500">
                    {!isLoggedIn && "Login required to access AI insights"}
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {/* Result Popup */}
                {showPopup && result && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold">AI Insight: Loan Analysis</h3>
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
                                            <span className="text-gray-600">Monthly EMI</span>
                                            <span className="font-semibold text-lg">{formatCurrency(Math.round(result.emi))}</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${Math.min((result.emi / formData.monthlyIncome) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {Math.round((result.emi / formData.monthlyIncome) * 100)}% of monthly income
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-gray-600">Affordability Score</span>
                                            <span className="font-semibold text-lg">{result.score}/100</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 rounded-full">
                                            <div
                                                className={`h-full rounded-full ${
                                                    result.score >= 70 ? 'bg-green-500' :
                                                    result.score >= 40 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${result.score}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Info className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium">Optimal tenure: {result.optimalTenure} years</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Info className="w-5 h-5 text-blue-500" />
                                            <span className="font-medium">Suggested down payment: {formatCurrency(Math.round(result.optimalDownPayment))}</span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                                            <div>
                                                <span className="font-medium">Recommendation:</span>
                                                <p className="text-sm mt-1">{result.suggestion}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-3 text-lg">EMI Breakdown</h4>
                                        <div className="h-64">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={result.breakdown}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: 0 }} />
                                                    <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                                                    <Tooltip formatter={(value) => [formatCurrency(Math.round(Number(value))), undefined]} />
                                                    <Line type="monotone" dataKey="principal" stroke="#3B82F6" name="Principal Paid" strokeWidth={2} />
                                                    <Line type="monotone" dataKey="interest" stroke="#EF4444" name="Interest Paid" strokeWidth={2} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
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
        </div>
    );
}