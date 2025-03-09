import PrevNavigate from "../../components/prevNavigat"
import { useState, useEffect } from "react";
import Loading from '../../components/loading';
import { useLocation } from "react-router-dom";
import MyContractABI from '../../mycontract.json';
import { ethers } from 'ethers';

const SafeOverview = () => {
    const location = useLocation();
    const { contractAddress } = location.state || {};
    const [owners, setOwners] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eventDetails, setEventDetails] = useState({
        eventPurpose: '',
        eventStatus: 0,
        currentThreshold: 0,
        isDeadlineActive: false,
        eventDeadline: 0
    });
    const EVENT_STATUS = {
        0: 'No Active Event',
        1: 'Pending',
        2: 'Successful',
        3: 'Failed'
    };

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                // Connect to Ethereum provider (e.g., MetaMask)
                const provider = new ethers.providers.Web3Provider(window.ethereum);

                // Request account access
                await provider.send("eth_requestAccounts", []);

                // Create contract instance
                const contract = new ethers.Contract(contractAddress, MyContractABI.abi, provider);

                // Fetch owners
                const fetchedOwners = await contract.getOwners();
                const [purpose, status, threshold, deadlineActive, deadline] = await Promise.all([
                    contract.eventPurpose(),
                    contract.eventStatus(),
                    contract.threshold(),
                    contract.isDeadlineActive(),
                    contract.eventDeadline()
                ]);

                setEventDetails({
                    eventPurpose: purpose,
                    eventStatus: status,
                    currentThreshold: threshold.toNumber(),
                    isDeadlineActive: deadlineActive,
                    eventDeadline: new Date(deadline.toNumber() * 1000).toLocaleString()
                });
                setOwners(fetchedOwners);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };
        if (window.ethereum) {
            fetchOwners();
        } else {
            setError("Ethereum provider not found. Please install MetaMask.");
            setIsLoading(false);
        }
    }, [contractAddress]);

    if (isLoading) {
        return <Loading />;
    }
    if (error) return <div>Error: {error}</div>;
    return (
        <div className="flex flex-col gap-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <PrevNavigate />
                <h2 className="text-2xl font-bold mb-4 text-teal-800 pl-12">Welcome to Your Safe</h2>
                <p>Manage your multi-signature wallet with advanced security features.</p>
            </div>
            <div className="flex flex-col justify-center w-full gap-6 items-center">
                <div className="flex flex-col justify-center items-center gap-2 w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-2xl font-bold">Gnosis Safe Owners</h2>
                    <ul className="bg-white rounded-md shadow-md px-10 py-2">
                        {owners.map((owner, index) => (
                            <li key={index} className="owner-address">
                                {owner}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-row justify-center items-center gap-4 w-1/2 py-6 px-10 rounded-md shadow-md bg-black bg-opacity-80">
                    <div className="flex flex-col justify-center items-center gap-4 w-1/2 bg-teal-700 rounded-md shadow-md ">
                        <div className="p-2">
                            <h2 className="text-2xl font-bold">Gnosis Safe Treshold</h2>
                            <p className="bg-white rounded-md shadow-md p-2">{eventDetails.currentThreshold}</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4 w-1/2 bg-teal-700 rounded-md shadow-md ">
                        <div className="p-2">                        <h2 className="text-2xl font-bold">Gnosis Safe Event Status</h2>
                            <div className="bg-white p-2 rounded-md shadow-md">
                                <p>
                                    <strong>Event Purpose:</strong>{' '}
                                    {eventDetails.eventPurpose || 'No current event'}
                                </p>
                                <p>
                                    <strong>Status:</strong>{' '}
                                    {EVENT_STATUS[eventDetails.eventStatus]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-center items-center gap-6 w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <p className="bg-white p-2 rounded-md shadow-md">
                        <strong>Deadline Active:</strong>{' '}
                        {eventDetails.isDeadlineActive ? 'Yes' : 'No'}
                    </p>
                    {eventDetails.isDeadlineActive && (
                        <p className="bg-white p-2 rounded-md shadow-md">
                            <strong>Event Deadline:</strong>{' '}
                            {eventDetails.eventDeadline}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SafeOverview;