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
                    <img src="/img/logo.png" alt="" className="h-full" width={100} />
                    <p>
                        <span className="font-semibold">CV. Cardano Hub Indonesia</span>
                        <br />
                        Indonesia
                    </p>
                </aside>
                <nav>
                    <h6 className="footer-title">Community</h6>
                    {[
                        { name: "About Us", href: "/about" },
                        { name: "Read Docs", href: "https://comunity-node.gitbook.io/cardanohubindonesia" }
                    ].map((service) => (
                        <a key={service.name} href={service.href} className="link link-hover">
                            {service.name}
                        </a>
                    ))}
                </nav>
                <nav>
                    <h6 className="footer-title">Extras</h6>
                    {[
                        { name: "Quests", href: "/quest" },
                        { name: "Events", href: "/Event" },
                    ].map((item) => (
                        <a key={item.name} href={item.href} className="link link-hover">
                            {item.name}
                        </a>
                    ))}
                </nav>
                <nav>
                    <h6 className="footer-title">Legal</h6>
                    {[
                        { name: "Twitter", href: process.env.URL_TWITTER },
                        { name: "Telegram", href: process.env.URL_TELEGRAM },
                        { name: "Discord", href: process.env.URL_DISCORD }
                    ].map((policy) => (
                        <a key={policy.name} href={policy.href} className="link link-hover" target="_blank" rel="noopener noreferrer">
                            {policy.name}
                        </a>
                    ))}
                </nav>

            </footer>
            <div className=""></div>
            <footer className="footer bg-white text-black items-center p-4">
                <aside className="grid-flow-col items-center">
                    <img src="/img/logo.png" alt="" className="h-full" width={100} />

                </aside>
                <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
                    {/* <SocialIcon type="twitter" />
                    <SocialIcon type="discord" />
                    <SocialIcon type="telegram" /> */}
                    <p>Copyright © {currentYear} - All rights reserved</p>
                </nav>
            </footer>
        </>
    );
};

export default Footer;
