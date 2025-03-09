import NavBar from "../components/navbar"
import Footer from "../components/footer"
import Loading from "../components/loading";
import { useState, useEffect } from "react";
import TextAnimation from "../components/textanimation";
import { motion } from 'framer-motion';
export default function HomePage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simulates loading for 3 seconds
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col min-h-screen gap-6 bg-teal-900">
            <NavBar />
            <div className="flex flex-col justify-center mt-20 gap-6 items-center">
                <div className="flex flex-row justify-center items-center gap-2">
                    <h1 className="text-4xl font-black animate-text bg-gradient-to-r from-gray-500 via-red-500 to-orange-500 bg-clip-text text-transparent">Welcome to MultiSignSafe</h1>
                    <h1 className="text-4xl animate-pulse">🌐🔒</h1>
                </div>
                <div className="flex flex-col justify-center gap-6 items-center w-2/3">
                    <div className="text-3xl font-bold">
                        <TextAnimation text='Your Gateway to Secure Collaboration for Funds' />
                    </div>
                    <motion.p
                        initial={{ scale: 0 }} animate={{ scale: 1, transition: { duration: 2 } }}
                        className="text-lg font-semibold text-justify bg-opacity-80 bg-white p-6 rounded-lg shadow-md shadow-black">At MultiSignSafe, we prioritize security and transparency in managing your funds.
                        Designed for seamless teamwork, our multi-signature smart contract platform ensures
                        that all transactions are conducted with the highest level of trust and precision.</motion.p>
                </div>
            </div>
            <Footer />
        </div>
    )
}