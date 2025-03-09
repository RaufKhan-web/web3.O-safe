import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PrevNavigate from "../../components/prevNavigat";
import { useLocation } from "react-router-dom";
import MyContractABI from '../../mycontract.json';
import Loading from '../../components/loading';

const ChangeThreshold = () => {
    const location = useLocation();
    const { contractAddress } = location.state || {};
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [owners, setOwners] = useState([]);
    const [walletSigner, setWalletSigner] = useState(null);
    const [proposedThreshold, setProposedThreshold] = useState(0);
    const [mainContract, setMainContract] = useState(null);
    const [eventDetails, setEventDetails] = useState({
        eventPurpose: '',
        eventStatus: 0,
        currentThreshold: 0,
        isDeadlineActive: false,
        eventDeadline: 0,
        votesFor: 0,
        votesAgainst: 0
    });

    const EVENT_STATUS = {
        0: 'No Active Event',
        1: 'Pending',
        2: 'Successful',
        3: 'Failed'
    };

    useEffect(() => {
        const fetchContractData = async () => {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                setWalletSigner(signer);
                await provider.send("eth_requestAccounts", []);
                const contract = new ethers.Contract(contractAddress, MyContractABI.abi, provider);
                setMainContract(contract);

                // const signer = provider.getSigner();
                // const contractWithSigner = contract.connect(signer);

                const [
                    fetchedOwners,
                    purpose,
                    status,
                    threshold,
                    deadlineActive,
                    deadline,
                    votesForCount,
                    votesAgainstCount
                ] = await Promise.all([
                    contract.getOwners(),
                    contract.eventPurpose(),
                    contract.eventStatus(),
                    contract.threshold(),
                    contract.isDeadlineActive(),
                    contract.eventDeadline(),
                    contract.votesFor(),
                    contract.votesAgainst()
                ]);

                setEventDetails({
                    eventPurpose: purpose,
                    eventStatus: status,
                    currentThreshold: threshold.toNumber(),
                    isDeadlineActive: deadlineActive,
                    eventDeadline: new Date(deadline.toNumber() * 1000).toLocaleString(),
                    votesFor: votesForCount.toNumber(),
                    votesAgainst: votesAgainstCount.toNumber()
                });
                setOwners(fetchedOwners);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        if (window.ethereum) {
            fetchContractData();
        } else {
            setError("Ethereum provider not found. Please install MetaMask.");
            setIsLoading(false);
        }
    }, [contractAddress]);

    const initiateThresholdUpdate = async () => {
        try {
            const contract = new ethers.Contract(contractAddress, MyContractABI.abi, walletSigner);

            const tx = await contract.initiateUpdateTreshold(proposedThreshold);
            await tx.wait();
        } catch (err) {
            setError(err.message);
        }
    };

    const voteOnEvent = async (approve) => {
        try {
            const contract = new ethers.Contract(contractAddress, MyContractABI.abi, walletSigner);

            const tx = await contract.voteForEvent(approve);
            await tx.wait();
            if (approve === true) {
                setEventDetails({ ...eventDetails, votesFor: (await mainContract.votesFor()).toNumber });
            }
            else {
                setEventDetails({ ...eventDetails, votesAgainst: (await mainContract.votesAgainst()).toNumber });
            }
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) {
        return <Loading />;
    }
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col gap-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <PrevNavigate />
                <h2 className="text-2xl font-bold mb-4 text-teal-800 pl-12">Threshold Update</h2>
                <p>Manage and update your Gnosis Safe threshold.</p>
            </div>

            <div className="flex flex-col p-4 justify-center w-full gap-6 items-center">
                {/* Owners Section */}
                <div className="flex flex-col justify-center items-center gap-2 w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-2xl font-bold text-white">Gnosis Safe Owners</h2>
                    <ul className="bg-white rounded-md shadow-md px-10 py-2">
                        {owners.map((owner, index) => (
                            <li key={index} className="owner-address">{owner}</li>
                        ))}
                    </ul>
                </div>

                {/* Threshold and Event Status */}
                <div className="flex flex-row justify-center items-center gap-4 w-1/2 py-6 px-10 rounded-md shadow-md bg-black bg-opacity-80">
                    <div className="flex flex-col justify-center items-center gap-4 w-1/2 bg-teal-700 rounded-md shadow-md">
                        <div className="p-2">
                            <h2 className="text-2xl font-bold text-white">Current Threshold</h2>
                            <p className="bg-white rounded-md shadow-md p-2">{eventDetails.currentThreshold}</p>
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4 w-1/2 bg-teal-700 rounded-md shadow-md">
                        <div className="p-2">
                            <h2 className="text-2xl font-bold text-white">Event Status</h2>
                            <div className="bg-white p-2 rounded-md shadow-md">
                                <p><strong>Purpose:</strong> {eventDetails.eventPurpose || 'No current event'}</p>
                                <p><strong>Status:</strong> {EVENT_STATUS[eventDetails.eventStatus]}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Threshold Update Initiation */}
                <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-teal-700">
                    <h2 className="text-2xl font-bold text-white mb-4">Update Threshold</h2>
                    <div className="bg-white p-4 rounded-md shadow-md">
                        <input
                            type="number"
                            placeholder="Enter New Threshold"
                            value={proposedThreshold}
                            onChange={(e) => setProposedThreshold(Number(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md mb-4"
                        />
                        <button
                            onClick={initiateThresholdUpdate}
                            className="w-full bg-teal-700 text-white py-2 rounded-md hover:bg-teal-800"
                        >
                            Initiate Threshold Change
                        </button>
                    </div>
                </div>

                {/* Voting Section */}
                {eventDetails.eventStatus === 1 && (
                    <div className="w-1/2 py-6 px-12 rounded-md shadow-md bg-black bg-opacity-80 flex gap-4">
                        <div className="w-1/2 bg-teal-700 rounded-md p-4">
                            <h3 className="text-xl font-bold text-white mb-2">Vote For</h3>
                            <div className="bg-white p-2 rounded-md">
                                <p className="text-center text-2xl font-bold">{eventDetails.votesFor}</p>
                                <button
                                    onClick={() => voteOnEvent(true)}
                                    className="w-full bg-green-500 text-white py-2 rounded-md mt-2"
                                >
                                    Approve
                                </button>
                            </div>
                        </div>
                        <div className="w-1/2 bg-teal-700 rounded-md p-4">
                            <h3 className="text-xl font-bold text-white mb-2">Vote Against</h3>
                            <div className="bg-white p-2 rounded-md">
                                <p className="text-center text-2xl font-bold">{eventDetails.votesAgainst}</p>
                                <button
                                    onClick={() => voteOnEvent(false)}
                                    className="w-full bg-red-500 text-white py-2 rounded-md mt-2"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deadline Information */}
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
    );
};

export default ChangeThreshold;