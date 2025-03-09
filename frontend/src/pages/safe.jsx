import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Shield, Users, Edit, Trash2 } from 'lucide-react';
import Loading from '../components/loading';
import TextAnimation from '../components/textanimation';
import { motion } from 'framer-motion';


// Side Menu Component
const SideMenu = ({ isOpen, onClose, contractAddress }) => {
    const navigate = useNavigate();

    const menuItems = [
        {
            icon: <Shield className="w-6 h-6" />,
            label: 'Safe Overview',
            path: '/dashboard/safe/over-view'
        },
        {
            icon: <Users className="w-6 h-6" />,
            label: 'Add Owner',
            path: '/dashboard/safe/add-owner'
        },
        {
            icon: <Edit className="w-6 h-6" />,
            label: 'Change Threshold',
            path: '/dashboard/safe/threshold'
        },
        {
            icon: <Trash2 className="w-6 h-6" />,
            label: 'Remove Owner',
            path: '/dashboard/safe/remove-owner'
        },
        {
            icon: <Edit className="w-6 h-6" />,
            label: 'Transactions',
            path: '/dashboard/safe/transactions'
        }
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-40"
                    onClick={onClose}
                />
            )}
            <div
                className={`fixed top-0 left-0 w-64 h-full bg-teal-900 text-white 
        transform transition-transform duration-300 z-50 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="p-4 border-b border-teal-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold truncate">Safe Menu</h2>
                    <X
                        className="cursor-pointer"
                        onClick={onClose}
                    />
                </div>
                <nav className="mt-4">
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            onClick={() => {
                                const params = { contractAddress: contractAddress }
                                navigate(item.path, { state: params });
                                onClose();
                            }}
                            className="flex items-center p-3 hover:bg-teal-800 cursor-pointer transition"
                        >
                            {item.icon}
                            <span className="ml-3">{item.label}</span>
                        </div>
                    ))}
                </nav>
            </div>
        </>
    );
};

// Main Safe Dashboard
const SafeDashboard = () => {
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const location = useLocation();
    const { safeAddress, safeName } = location.state || {};
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simulates loading for 3 seconds
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    const handleClick = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-teal-900 text-white p-4 flex justify-between items-center">
                <button
                    onClick={() => setIsSideMenuOpen(true)}
                    className="p-2 bg-teal-700 rounded-md hover:bg-teal-600"
                >
                    <Menu />
                </button>
                <h1 className="text-xl font-bold">Safe Management Dashboard</h1>
            </header>

            <SideMenu
                isOpen={isSideMenuOpen}
                contractAddress={safeAddress}
                onClose={() => setIsSideMenuOpen(false)}
            />
            <div className='flex flex-col mt-8 gap-4 justify-center items-center'>
                <div className='flex flex-col justify-evenly items-center bg-teal-700 text-white p-6 rounded-lg shadow-md'>
                    <h1 className="text-2xl font-bold">Safe Address: {safeAddress}</h1>
                    <h2 className="text-xl font-bold">Safe Name: {safeName}</h2>
                </div>
                <div className="flex flex-col justify-center text-left items-center gap-2 w-2/4">
                    <div className="text-3xl font-bold">
                        <TextAnimation text='🚀 Key Features You’ll Love' />
                    </div>
                    <motion.ul initial={{ scale: 0 }} animate={{ scale: 1, transition: { duration: 2 } }}
                        className="flex flex-col text-xl font-semibold gap-1 bg-opacity-80 bg-white justify-center p-6 rounded-lg shadow-md shadow-black ">
                        <li>Robust Security:<span className="font-normal"> Protect your funds with multi-signature authentication.</span></li>
                        <li>Voting System: <span className="font-normal">Easily add or remove owners and adjust transaction thresholds through secure on-chain voting.</span></li>
                        <li>Threshold-Based Releases:<span className="font-normal"> Transactions are initiated and released only when the predefined threshold of approvals is met, ensuring accountability.</span></li>
                        <li>Transparency & Control:<span className="font-normal"> Every action is documented, and funds are forwarded to their rightful owner with no room for error.</span></li>
                    </motion.ul>
                </div>
                <button onClick={handleClick} className='ease-in duration-300 text-white rounded-md text-base p-2 w-auto h-auto font-semibold shadow-md bg-teal-800 hover:delay-150 hover:text-lg'>
                    Back To The Main Dashboard
                </button>
            </div>
        </div>
    );
};


export default SafeDashboard;
