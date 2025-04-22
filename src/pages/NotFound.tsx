import { Link } from "react-router-dom";
import { Logo } from "../components/home/Logo";

export default function NotFound() {
    return (
        <div className="min-h-[500px] bg-gray-100 flex flex-col items-center justify-center px-6 text-center">
            <Logo size={10} layout="col" />
            <h1 className="text-7xl font-extrabold mt-8 text-gray-500">404</h1>
            <p className="mt-4 text-xl font-medium text-gray-700">Page Not Found</p>
            <p className="mt-2 text-gray-500">Sorry, the page you're looking for doesn't exist.</p>
            <Link
                to="/"
                className="mt-6 inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Go Home
            </Link>
        </div>
    );
}
