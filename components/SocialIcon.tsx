import Link from "next/link";
import React from "react";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SocialIcon: React.FC<{href?:string, type: "twitter" | "discord" | "telegram" }> = ({ href, type }) => {
    const icons = {
        twitter: (<FaXTwitter/>),
        discord: (<FaDiscord/>),
        telegram: (<FaTelegram/>),
    };

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
            {icons[type]}
        </a>
    );
};

export default SocialIcon;