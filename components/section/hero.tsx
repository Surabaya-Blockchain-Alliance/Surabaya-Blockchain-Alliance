import React, { useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import AnimatedText from "../animated/typewriter";
import UnderlineButton from "../button/underlined";
import AnimatedBlobs from "../animated/blobs";

const Hero: React.FC = () => {
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

    const words = ['Connect', 'Collaborate', 'Amplify'];
    return (
        <section id="home" className="h-screen flex items-center justify-center text-white text-4xl font-bold bg-white snap-start">
            <div className="hero-content h-screen text-neutral-content text-left py-10">
                <AnimatedBlobs />
                <div className="flex items-center">
                    <div className="text-left space-y-2 w-full flex-auto">
                        <AnimatedText words={words} />
                        <small className="mb-5 text-black font-light text-base" data-aos="fade-up">
                            A platform to engage users & communities to make projects more recognizable
                        </small>
                        <div>
                            <UnderlineButton
                                href="/signin"
                                label="Start Create Quests"
                                textColor="text-black"
                                underlineColor="bg-black"
                                iconColor="text-black"
                            />
                        </div>
                    </div>
                    <div className="flex-none max-w-sm">
                        <DotLottieReact
                            src="https://lottie.host/6ea7e9d7-676c-499b-8cc2-263429375fc1/GXmcV65V3q.lottie"
                            loop
                            autoplay
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
