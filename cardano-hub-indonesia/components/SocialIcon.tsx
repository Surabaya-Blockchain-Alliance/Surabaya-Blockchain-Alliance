import React from "react";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SocialIcon: React.FC<{ type: "twitter" | "discord" | "telegram" }> = ({ type }) => {
    const icons = {
        twitter: (<FaXTwitter/>),
        discord: (<FaDiscord/>),
        telegram: (<FaTelegram/>),
    };

    return <a>{icons[type]}</a>;
};

export default SocialIcon; 