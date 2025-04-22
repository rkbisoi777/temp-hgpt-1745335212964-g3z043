import { Link } from "react-router-dom";
import { Logo } from "./home/Logo";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6">
            <div className="flex flex-col justify-center">
                <Link to={`/`} className="text-center px-4">
                    <Logo size={10} layout="col" showText={false} />
                    <h1 className="font-bold text-xl py-2 text-white">HouseGPT</h1>
                    <p className='text-white text-sm font-medium'>India's First AI-Powered Real Estate Agent & Platform</p>

                </Link>

                <div className="flex flex-col justify-center py-4">
                    <div className="flex justify-center space-x-4">
                        <a href="https://x.com/housegpt" aria-label="Twitter" className="hover:text-white transition"><i className="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com/housegpt.india" aria-label="Instagram" className="hover:text-white transition"><i className="fab fa-instagram"></i></a>
                        <a href="https://www.youtube.com/channel/UCJ784PG1ZS42VONJfTdMdJQ" aria-label="Youtube" className="hover:text-white transition"><i className="fab fa-youtube"></i></a>
                    </div>
                    <ul className="flex flex-wrap justify-center items-center gap-x-2 gap-y-2 py-4 text-sm font-semibold text-center">
                        {[
                            { label: "News", href: "/news" },
                            { label: "Blog", href: "/blogs" },
                            { label: "About Us", href: "#" },
                            { label: "Contact Us", href: "#" },
                            { label: "Terms & Conditions", href: "#" },
                            { label: "Privacy Policy", href: "#" }
                        ].map((item, index, arr) => (
                            <li key={index} className="flex items-center">
                                <a href={item.href} className="hover:text-white transition underline">{item.label}</a>
                                {index < arr.length - 1 && <span className="mx-2">•</span>}
                            </li>
                        ))}
                    </ul>

                    <p className="text-center text-sm font-semibold text-white">© {new Date().getFullYear()} HouseGPT. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
