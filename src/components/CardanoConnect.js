import React, {
    useState
} from 'react';
import {
    useCardano
} from '@cardano-foundation/cardano-connect-with-wallet';
import {
    FaClipboard,
    FaCaretDown
} from 'react-icons/fa';

const CardanoConnect = () => {
    const {
        isConnected,
        connect,
        disconnect,
        usedAddresses,
        balance,
    } = useCardano();

    const walletType = 'nami';

    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleConnect = async () => {
        await connect(walletType);
        console.log('Connected to wallet:', walletType);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => alert('Address copied to clipboard!'))
            .catch(err => alert('Failed to copy address!'));
    };

    const shortenAddress = (address) => {
        if (address.length > 10) {
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        }
        return address;
    };

    const getCurrentAddress = () => {
        if (usedAddresses && usedAddresses.length > 0) {
            return shortenAddress(usedAddresses[0]);
        }
        return 'Address not available';
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return ( <
            div style = {
                styles.container
            } > {
                isConnected ? ( <
                    div style = {
                        styles.card
                    } >
                    <
                    div style = {
                        styles.addressContainer
                    } >
                    <
                    p style = {
                        styles.address
                    } > {
                        getCurrentAddress()
                    } <
                    /p> <
                    button onClick = {
                        () => copyToClipboard(usedAddresses[0])
                    }
                    style = {
                        styles.copyButton
                    } >
                    <
                    FaClipboard / >
                    <
                    /button> < /
                    div > <
                    div style = {
                        styles.dropdownContainer
                    } >
                    <
                    button onClick = {
                        toggleDropdown
                    }
                    style = {
                        styles.viewButton
                    } >
                    View Account < FaCaretDown / >
                    <
                    /button> {
                    dropdownOpen && ( <
                        div style = {
                            styles.dropdownContent
                        } >
                        <
                        p > Address: {
                            getCurrentAddress()
                        } < /p> <
                        p > Balance: {
                            balance || 'Fetching...'
                        } < /p> <
                        button onClick = {
                            disconnect
                        }
                        style = {
                            styles.disconnectButton
                        } >
                        Disconnect <
                        /button> < /
                        div >
                    )
                } <
                /div> < /
                div >
            ): ( <
                div style = {
                    styles.connectContainer
                } >
                <
                button onClick = {
                    handleConnect
                }
                style = {
                    styles.connectButton
                } >
                Connect Nami Wallet <
                /button> < /
                div >
            )
        } <
        /div>
);
};

const styles = {
    container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '20px',
    },
    card: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px 0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: '300px',
        backgroundColor: '#ffffff',
    },
    addressContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    address: {
        flex: 1,
        overflowWrap: 'break-word',
        fontWeight: 'bold',
        fontSize: '12px',
    },
    copyButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#007bff',
    },
    dropdownContainer: {
        position: 'relative',
    },
    viewButton: {
        marginTop: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
    },
    dropdownContent: {
        position: 'absolute',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '10px',
        zIndex: 100,
        width: '100%',
    },
    disconnectButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
        marginTop: '10px',
    },
    connectContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '300px',
    },
    connectButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default CardanoConnect;