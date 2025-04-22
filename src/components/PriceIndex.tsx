import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";

interface HousingData {
    month: string;
    displayDate?: string;
    [key: string]: number | null | string | undefined; // Allows dynamic property assignment
}


const cities = [
    "India",
    "Mumbai",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "NCR",
    "Bengaluru",
    "Ahmedabad",
];

const housingTypes = ["1-BHK", "2-BHK", "3-BHK", "All"];

const colors: Record<string, string> = {
    "1-BHK": "#8884d8",
    "2-BHK": "#82ca9d",
    "3-BHK": "#ffc658",
    All: "#ff7300",
};

const HousingPriceGraph = () => {
    const [data, setData] = useState<HousingData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedHousingType, setSelectedHousingType] = useState<string>("All");
    const [selectedCity, setSelectedCity] = useState<string>("India");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`https://souhxhftbgidoxfgfqmu.supabase.co/storage/v1/object/public/priceindex//${selectedCity.toLowerCase()}.csv`);
                // const response = await fetch(`/${selectedCity.toLowerCase()}.csv`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const csvText = await response.text();
                const parsedData = parseCSVData(csvText);
                setData(parsedData);
                setError(null);
            } catch (err) {
                console.error("Error fetching or parsing CSV data:", err);
                setError("Failed to load data. Please try again later.");
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedCity]);

    const parseCSVData = (csvText: string): HousingData[] => {
        const lines = csvText.split("\n").filter((line) => line.trim() !== "");
        if (lines.length < 2) return [];

        const headers = lines[0].split(",").map((h) => h.trim());

        return lines.slice(1).map((line) => {
            const values = line.split(",");
            let obj: HousingData = { month: values[0].trim() };

            // Normalize month format to YYYY-MM
            let dateParts = obj.month.split("-");
            if (dateParts.length === 3) {
                if (dateParts[0].length === 4) {
                    // Format: YYYY-MM-DD
                    obj.month = `${dateParts[0]}-${dateParts[1]}`; // YYYY-MM
                } else {
                    // Format: DD-MM-YYYY
                    obj.month = `${dateParts[2]}-${dateParts[1]}`; // YYYY-MM
                }
            }

            obj.displayDate = obj.month.replace("-", "/");

            headers.forEach((header, index) => {
                if (index === 0) return;
                const numValue = parseFloat(values[index]);
                obj[header] = isNaN(numValue) ? null : numValue;
            });

            return obj;
        }).filter((item) => item.month);
    };

    const getYearlyTicks = (): string[] => {
        const yearlyTicks = new Set<string>();

        data.forEach((item) => {
            const year = item.month.split("-")[0]; // Extract year
            yearlyTicks.add(`${year}-01`); // Set as January of each year
        });

        return Array.from(yearlyTicks).sort(); // Ensure sorted order
    };


    const CustomTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string }> = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const dataPoint = data.find((item) => item.month === label);
        if (!dataPoint) return null;

        return (
            <div className="bg-white p-4 border border-gray-200 rounded shadow-lg">
                <p className="font-bold">{dataPoint.displayDate || label}</p>
                {housingTypes.map((type) => (
                    <p key={type} style={{ color: colors[type] }}>
                        {type}:
                        {typeof dataPoint[type] === "number" ? (dataPoint[type] as number).toFixed(2) : "N/A"}
                    </p>
                ))}
            </div>
        );
    };


    return (
        <div className="p-4 bg-white rounded-lg border border-gray-200">

            <div className="flex flex-col justify-center items-center text-center mb-2">
                <h2 className="md:text-xl text-blue-500 font-bold mb-1 sm:text-md">Housing Price Index (2017-2024)</h2>
                <p className="text-gray-600 mb-1 md:text-md sm:text-sm">Base value (100) set at January 2017</p>
            </div>

            {/* City Dropdown */}
            <div  className="flex justify-center">
            <div className="mb-4 w-1/2">
                <select
                    className="mt-1 block w-full p-1 border border-gray-300 rounded-md focus:ring focus:ring-primary"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>
            </div>
            </div>


            {/* Housing Type Tabs */}
            <div className="mb-6 flex gap-2 border-b border-gray-200">
                {housingTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedHousingType(type)}
                        className={`px-4 py-2 text-sm font-medium transition-all focus:outline-none ${selectedHousingType === type
                            ? "border-b-2 border-primary text-primary"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Chart Content */}
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

                        <XAxis
                            dataKey="month"
                            ticks={getYearlyTicks()}
                            tickFormatter={(value) => value.split("-")[0]} // Show only the year
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            domain={[80, 220]}
                            label={{ value: "Index Value", angle: -90, position: "insideLeft" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />

                        {selectedHousingType === "All"
                            ? housingTypes
                                .filter((type) => type !== "All")
                                .map((type) => (
                                    <Line
                                        key={type}
                                        type="monotone"
                                        dataKey={type}
                                        stroke={colors[type]}
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                ))
                            : selectedHousingType && (
                                <Line
                                    type="monotone"
                                    dataKey={selectedHousingType}
                                    stroke={colors[selectedHousingType]}
                                    strokeWidth={3}
                                    dot={false}
                                />
                            )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HousingPriceGraph;
