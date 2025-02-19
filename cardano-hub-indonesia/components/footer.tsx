import React from "react";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import LogoIcon from "./LogoIcon";
import SocialIcon from "./SocialIcon";

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <>
            <footer className="footer bg-white text-black p-10">
                <aside>
                    <LogoIcon />
                    <p>
                        ACME Industries Ltd.
                        <br />
                        Providing reliable tech since 1992
                    </p>
                </aside>
                <nav>
                    <h6 className="footer-title">Services</h6>
                    {["Branding", "Design", "Marketing", "Advertisement"].map((service) => (
                        <a key={service} className="link link-hover">
                            {service}
                        </a>
                    ))}
                </nav>
                <nav>
                    <h6 className="footer-title">Company</h6>
                    {["About us", "Contact", "Jobs", "Press kit"].map((item) => (
                        <a key={item} className="link link-hover">
                            {item}
                        </a>
                    ))}
                </nav>
                <nav>
                    <h6 className="footer-title">Legal</h6>
                    {["Terms of use", "Privacy policy", "Cookie policy"].map((policy) => (
                        <a key={policy} className="link link-hover">
                            {policy}
                        </a>
                    ))}
                </nav>
            </footer>
            <div className=""></div>
            <footer className="footer bg-white text-black items-center p-4">
                <aside className="grid-flow-col items-center">
                    <LogoIcon size={36} />
                    <p>Copyright © {currentYear} - All rights reserved</p>
                </aside>
                <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                    <SocialIcon type="twitter" />
                    <SocialIcon type="discord" />
                    <SocialIcon type="telegram" />
                </nav>
            </footer>
        </>
    );
};

export default Footer;
