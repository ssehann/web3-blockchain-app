import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

// use context to share data across different components in the app without manually passing them as props
export const TransactionContext = React.createContext();

// extract the ethereum object from window, which is available if MetaMask is installed
const { ethereum } = window;
// helper function to create the contract
const createEthereumContract = () => {
    // connect the app to the blockchain via MetaMask
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    // create and return an instance of the contract
    const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);
    return transactionContract;
}

// main provider component that makes context available throughout the app
// wrap components with a component provider to make them children with access to the state and functions provided here
export const TransactionProvider = ({ children }) => {
    // DEFINE ALL NECESSARY STATES
    // state for connectly account
    const [currentAccount, setCurrentAccount] = useState("");
    // state for getting transaction details
    const [formData, setFormData] = useState({ addressTo: '', amount: '', keyword: '', message: '' });
    // dynamically update formData
    const handleChange = (e, name) => {
        // copy all the properties of the previous state into a new object
        // then using computed property names, update the specific field in the state
        setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
    }
    // state for loading when processing transaction
    const [isLoading, setIsLoading] = useState(false);
    // state to keep track of transaction count
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    // state to keep track of all transactions
    const [transactions, setTransactions] = useState([]);

    // DEFINE ALL METHODS
    const getAllTransactions = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");
            const transactionContract = createEthereumContract();
            const availableTransanctions = await transactionContract.getAllTransactions();
            const structuredTransactions = availableTransanctions.map((transaction) => ({
                addressTo: transaction.receiver,
                addressFrom: transaction.sender,
                timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                message: transaction.message,
                keyword: transaction.keyword,
                amount: parseInt(transaction.amount._hex) / (10 ** 18)
            }));
            setTransactions(structuredTransactions);
            console.log("All transactions: ", structuredTransactions);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    // check if MetaMask is installed & user has connected their account
    // if so, set the currentAccount state to their ethereum address
    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                getAllTransactions();
            } else {
                console.log("No accounts found");
            }
            console.log("Accounts: ", accounts);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const checkIfTransactionsExist = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");
            const transactionContract = createEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();

            window.localStorage.setItem("transactionCount", transactionCount);
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    const sendTransaction = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask");
            const { addressTo, amount, keyword, message } = formData;
            const parsedAmount = ethers.utils.parseEther(amount); // convert eth to wei hex string
            const transactionContract = createEthereumContract();
            console.log("Transaction Contract: ", transactionContract);
            
            // send transaction in progress...
            await ethereum.request({ 
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // = 21000 GWEI = 0.000021 eth
                    value: parsedAmount._hex,
                }]
            });

            // record transaction on the blockchain, using our function from Transactions.sol
            const transactionHash = await transactionContract.addToBlockChain(addressTo, parsedAmount, message, keyword);

            // wait for the transaction to be mined (confirmed) on the Ethereum blockchain
            // - takes some time, so add a loading state with hash-specific message
            setIsLoading(true);
            console.log(`Loading - ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false); 
            console.log(`Success - ${transactionHash.hash}`);

            const transactionCount = await transactionContract.getTransactionCount();
            setTransactionCount(transactionCount.toNumber());
            window.location.reload();

        } catch (error) {
            console.log(error);
            throw new Error("No ethereum object");
        }
    }

    // react hook to run after the component mounts - when TransactionProvider is first rendered
    // runs checkIfWalletIsConnected and (if that passes) checkIfTransactionsExist
    useEffect(() => {
        checkIfWalletIsConnected();
        checkIfTransactionsExist();
    }, []);

    return (
        <TransactionContext.Provider 
            value={{ connectWallet, 
                    transactions,
                    transactionCount,
                    currentAccount, 
                    formData, 
                    setFormData, 
                    handleChange, 
                    sendTransaction, 
                    isLoading }}>
            {children}
        </TransactionContext.Provider>
    );
}