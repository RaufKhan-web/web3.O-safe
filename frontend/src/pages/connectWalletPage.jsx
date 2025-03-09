import safe from '../assets/safe.png';
import Footer from '../components/footer';
import { useNavigate } from 'react-router-dom';
import Loading from "../components/loading";
import { useState, useEffect } from "react";
import PrevNavigate from '../components/prevNavigat';
import { motion } from 'framer-motion'
// import { ethers } from 'ethers';

export default function ConnectWalletPage() {
    var accounts = [];
    var account = '';
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState();
    const [mainContent, setMainContent] = useState(true);
    const [isLoading, setIsLoading] = useState(true);


    function handleButtonClick() {
        setMainContent(true);
    }


    async function handleAccount(accounts) {
        setWalletAddress(accounts);
    }

    const handleHomeNavigation = () => {
        navigate('/')
    }

    const handleDashboardNavigation = () => {
        const params = { ownerAddress: walletAddress }
        navigate('/dashboard', { state: params })
    }

    async function confirmConnect() {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await handleAccount(accounts[0]);
        handleDashboardNavigation();

    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000); // Simulates loading for 3 seconds
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    async function connectWallet() {
        if (!window.ethereum) {
            alert('MetaMask is not installed. Please install it to use this app.');
            return;
        }
        else {
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                account = accounts[0];
                alert(account);
                await handleAccount(account);

                if (!walletAddress) {
                    setMainContent(false);
                }
                else {
                    handleDashboardNavigation();
                }

            }
            catch (error) {
                console.error("Error connecting to wallet:", error);
            }
        }
    }


    return (
        <>
            {mainContent ? (
                <div className="min-h-screen bg-teal-900">
                    <nav className="flex justify-start items-center w-full bg-opacity-20 h-20 px-6 p-2 bg-teal-700">
                        <img onClick={handleHomeNavigation} className="hover:animate-bounce cursor-pointer h-16 w-16" src={safe} alt="app-icon" />
                        <h1 className="font-bold text-4xl">Gnosis Safe</h1>
                    </nav>
                    <div className='flex flex-row mt-10 p-6 gap-6 items-center'>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { duration: 2 } }}
                            className="flex flex-col gap-4 justify-center rounded-lg items-center shadow-lg shadow-gray-900 h-[420px] w-[700px] bg-gradient-to-b from-teal-600 to-gray-400">
                            <h1 className='w-96 text-center animate-text bg-gradient-to-r from-gray-500 via-red-500 to-orange-500 bg-clip-text text-transparent text-3xl font-black'>
                                Discover a fresh perspective on ownership
                            </h1>
                            <p className='w-72 text-lg font-semibold text-center'>The most reliable platform for decentralized custody and collaborative asset management.</p>
                        </motion.div>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1, transition: { duration: 2 } }}
                            className="flex flex-col gap-6 justify-center rounded-lg shadow-lg shadow-teal-800 items-center h-[420px] w-[700px] bg-white">
                            <div className='flex flex-col justify-center items-center'>
                                <img onClick={handleHomeNavigation} className="animate-pulse cursor-pointer h-20 w-20" src={safe} alt="app-icon" />
                                <h1 className="font-bold text-2xl">Gnosis Safe</h1>
                            </div>
                            <div className='flex flex-col justify-center items-center'>
                                <h1 className='font-semibold text-lg'>Get started</h1>
                                <p className='w-72 text-center'>Connect your MetaMask wallet to create a new Safe Account or open an existing one</p>
                            </div>
                            <div className='flex justify-center items-center w-40'>
                                <button onClick={connectWallet} className='ease-in duration-300 rounded-md text-normal w-32 h-8 font-semibold shadow-md bg-teal-800 hover:bg-opacity-50 hover:w-36 hover:h-9 hover:delay-150 hover:text-lg'>Connect</button>
                            </div>
                        </motion.div>
                    </div>
                    <Footer />
                </div>
            ) : (
                <div className='flex flex-col justify-center items-center bg-teal-800 min-h-screen'>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360, transition: { duration: 1 } }}
                        className="flex flex-col  gap-4 justify-center rounded-lg items-center shadow-lg shadow-gray-900 h-[350px] w-[600px] bg-gradient-to-b from-teal-600 to-gray-400">
                        <h1 className='w-96 text-center animate-text bg-gradient-to-r from-gray-500 via-red-500 to-orange-500 bg-clip-text text-transparent text-3xl font-black'>
                            Make sure the wallet you select is right!
                        </h1>
                        <button onClick={confirmConnect} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">Confirm Connect</button>
                    </motion.div>
                    <PrevNavigate handleClick={handleButtonClick} />
                </div>
            )}
        </>

    )
}