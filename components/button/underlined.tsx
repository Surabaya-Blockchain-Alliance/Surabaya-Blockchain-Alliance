'use client';

import React from 'react';
import { BsArrowRight } from 'react-icons/bs';

interface UnderlineButtonProps {
    label: string;
    href: string;
    textColor?: string;
    underlineColor?: string;
    target?: '_blank' | '_self' | '_parent' | '_top';
    iconColor?: string;
}

const UnderlineButton: React.FC<UnderlineButtonProps> = ({
    label,
    href,
    textColor = 'text-black',
    underlineColor = 'bg-blue-500',
    target = '_blank',
    iconColor = 'text-blue-500',
}) => {
    return (
        <a
            href={href}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            className={`relative inline-flex items-center gap-2 text-lg font-semibold ${textColor} no-underline group`}
        >
            {label}

            {/* Icon (Moves on Hover) */}
            <BsArrowRight
                className={`transition-transform duration-300 font-semibold transform group-hover:translate-x-1 ${iconColor}`}
            />

            {/* Underline Effect */}
            <span
                className={`absolute left-0 leading-normal bottom-0 h-[3px] w-0 ${underlineColor} transition-all duration-300 group-hover:w-[50%]`}
            ></span>
        </a>
    );
};

export default UnderlineButton;
