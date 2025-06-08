import Link from 'next/link';
import React from 'react';
import { FaCheckCircle, FaPrint, FaVideo } from 'react-icons/fa';

interface CertModalProps {
    id?: string;
    isOpen: boolean;
    onClose: () => void;
    handlePrint: () => void;
    imageUrl: string;
    metadata: string;
}

const CertModal: React.FC<CertModalProps> = ({
    id = 'cert_modal',
    isOpen,
    onClose,
    handlePrint,
    imageUrl,
    metadata,
}) => {
    return (
        <dialog id={id} className={`modal ${isOpen ? 'modal-open' : ''}`}>
            <div className="modal-box p-0 rounded-xl overflow-hidden shadow-lg w-full">
                {/* Top Ribbon */}
                <div className="flex items-start p-4 justify-start font-semibold text-2xl border-b">
                    {metadata}
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 p-6 bg-white">
                    <div className="hidden md:flex justify-center items-center bg-gradient-to-l from-white via-white to-transparent">
                        <img
                            src={imageUrl}
                            alt={metadata}
                            crossOrigin="anonymous"
                            className="object-cover rounded-lg w-full h-full"
                        />
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="btn w-full bg-blue-600 text-white hover:bg-blue-700 shadow-xl rounded-xl p-0 flex items-center justify-center gap-2 mt-4"
                >
                    <FaPrint />
                    <span className='pt-1'>Print</span>
                </button>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-500 hover:text-black"
                >
                    ✕
                </button>
            </div>
        </dialog >
    );
};

export default CertModal;
