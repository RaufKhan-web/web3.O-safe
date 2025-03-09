import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Loading from "../components/loading";
import { useState, useEffect } from "react";
import PrevNavigate from '../components/prevNavigat';
import axios from 'axios';
export default function DashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { ownerAddress } = location.state || {};
    const [address, setAddress] = useState(ownerAddress);
    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState([]); // User data object

    const handleNewSafeNavigation = () => {
        navigate('/dashboard/create-new-safe')
    }
    useEffect(() => {
        const createUser = async () => {
            try {
                const response = await axios.post("http://localhost:3000/createNewUser", { address });
                if (response.status === 200) {
                    setUserData(response.data.result);
                } else {
                    console.error("Error creating user:", response.status);
                    alert('Error creating user');
                }
            } catch (error) {
                console.error("Network error:", error);
                alert('Network error');
            } finally {
                setIsLoading(false);
            }
        };

        if (address) createUser();
    }, [address]);


    if (isLoading) {
        return <Loading />;
    }
    const handleButtonClick = () => {
        navigate(-1);
    };

    const handelSafeClick = (contractAddress, safeName) => {
        const params = { safeAddress: contractAddress, safeName: safeName };
        navigate('/dashboard/safe', { state: params });
    }
    return (
        <div className='min-h-screen bg-teal-900'>
            <div className='flex flex-col justify-center gap-10 p-6 items-center'>
                <div className=' flex flex-col justify-center items-center gap-4'>
                    <h1 className='text-teal-800  rounded-lg shadow-md shadow-gray-200 p-2 text-2xl bg-gray-200 font-bold'>Your Connected Wallet Address: {address}</h1>
                    <button onClick={handleNewSafeNavigation} className='ease-in duration-300 rounded-md text-normal w-32 h-8 font-semibold shadow-md bg-teal-800 hover:bg-opacity-50 hover:w-36 hover:h-9 hover:delay-150 hover:text-lg'>Create New Safe</button>
                </div>
                <div>
                    {userData.length >= 0 && (
                        <ul className='flex justify-start flex-wrap'>
                            {userData.map((safe, index) => (
                                <div onClickCapture={() => handelSafeClick(safe.contract_address, safe.safe_name)} className='ease-in duration-500 flex flex-col justify-around w-64 h-24 text-teal-800 rounded-lg shadow-md shadow-gray-300 p-2 text-lg bg-gray-200 font-bold hover:bg-black hover:text-white hover:cursor-pointer hover:ease-out hover:delay-300 hover:w-72 hover:h-28 hover:bg-opacity-50 ' key={index}>
                                    <h2>{safe.safe_name}</h2>
                                    <p className='truncate'>{safe.contract_address}</p>
                                </div>
                            ))}
                        </ul>
                    )}

                </div>
            </div>


            <PrevNavigate />
        </div>
    )
}