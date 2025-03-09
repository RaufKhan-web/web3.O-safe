import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const WalletListener = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isWalletConnected, setIsWalletConnected] = useState(false);

    useEffect(() => {
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                setIsWalletConnected(accounts.length > 0);
            } else {
                console.error("Ethereum provider not found!");
                setIsWalletConnected(false);
            }
        };

        checkWalletConnection();

        const handleAccountsChanged = async (accounts) => {
            // Remove the redundant declaration here
            if (accounts.length === 0) {
                navigate('/welcome');
            }
            setIsWalletConnected(accounts.length > 0);
        };

        const handleDisconnect = () => {
            setIsWalletConnected(false);
            navigate('/welcome');
        };

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('disconnect', handleDisconnect);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('disconnect', handleDisconnect);
            };
        }
    }, [navigate]);

    useEffect(() => {
        if (
            location.pathname !== '/' &&
            location.pathname !== '/welcome' &&
            !isWalletConnected
        ) {
            navigate('/welcome');
        }
    }, [location.pathname, isWalletConnected, navigate]);

    return null;
};

export default WalletListener;