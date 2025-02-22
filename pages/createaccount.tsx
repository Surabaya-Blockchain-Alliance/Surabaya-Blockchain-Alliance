import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../config'; 
import LogoIcon from '@/components/LogoIcon'; 
import SocialIcon from '@/components/SocialIcon';  
export default function ProfileSetup() {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (!currentUser) {
            router.push('/signin');
        }
    }, [currentUser, router]);

    const handleProfileSave = async () => {
        try {
            setLoading(true);
            console.log('Profile saved with username:', username);
            router.push('/profile');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = `
          @keyframes bg-scrolling-reverse {
            100% { background-position: 50px 50px; }
          }
        `;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    const bgImage: string = 
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC';

    return (
        <div className="min-h-screen">
            <div className="w-full h-screen text-gray-800">
                <div
                    className="grid grid-cols-2 justify-between items-start gap-10"
                    style={{
                        fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
                        background: `url(${bgImage}) repeat 0 0`,
                        animation: 'bg-scrolling-reverse 0.92s linear infinite',
                    }}
                >
                    <div className="h-screen bg-white w-full max-w-xl shrink-0 shadow-2xl items-center py-5 px-10">
                        <div className="flex justify-between items-center">
                            <LogoIcon />
                        </div>
                        <div className="pt-16 pb-5">
                            <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h1>
                            <p className="text-sm font-medium text-gray-700">Fill in your details</p>
                        </div>
                        <div className="py-2">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)} 
                                placeholder="Enter a username"
                            />
                        </div>
                        <div className="space-y-4 mt-4">
                            <button 
                                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md"
                                onClick={() => alert('Connect Twitter')} 
                                disabled={loading}
                            >
                                <span>Connect X</span>
                                <SocialIcon type="twitter" size={24} />
                            </button>

                            <button 
                                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md"
                                onClick={() => alert('Connect Discord')} 
                                disabled={loading}
                            >
                                <span>Connect Discord</span>
                                <SocialIcon type="discord" size={24} />
                            </button>

                            <button 
                                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md"
                                onClick={() => alert('Connect Telegram')} 
                                disabled={loading}
                            >
                                <span>Connect Telegram</span>
                                <SocialIcon type="telegram" size={24} />
                            </button>

                            <button 
                                className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md"
                                onClick={() => alert('Connect Yoroi Wallet')} 
                                disabled={loading}
                            >
                                <span>Connect Wallet</span>
                                <SocialIcon type="wallet" size={24} />
                            </button>
                        </div>
                        <div className="py-3">
                            <button 
                                className="btn w-full bg-black shadow-xl text-white hover:bg-gray-800" 
                                onClick={handleProfileSave} 
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>

                        <footer className="footer bg-white text-black items-center sticky bottom-0 top-full">
                            <aside className="grid-flow-col items-center">
                                <LogoIcon size={24} />
                                <p>Copyright © {currentYear} - All rights reserved</p>
                            </aside>
                            <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                                <SocialIcon type="twitter" />
                                <SocialIcon type="discord" />
                                <SocialIcon type="telegram" />
                            </nav>
                        </footer>
                    </div>

                    <div className="py-2">
                        <h1 className="text-4xl font-semibold">Cardano Hub Indonesia</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}
