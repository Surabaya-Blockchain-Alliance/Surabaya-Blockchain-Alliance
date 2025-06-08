'use client';

import { useEffect, useState } from 'react';
import UnderlineButton from '@/components/button/underlined';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function LoadingScreen() {
    const [isSlow, setIsSlow] = useState(false);

    useEffect(() => {
        // Trigger slow connection warning after 5 seconds
        const timeout = setTimeout(() => {
            setIsSlow(true);
        }, 15000);

        // Clear timeout if unmounted
        return () => clearTimeout(timeout);
    }, []);

    return (
        <section className="min-h-screen mx-auto bg-white items-center justify-center flex">
            <div className="text-black">
                <div className="space-y-10 text-center">
                    <DotLottieReact
                        src={isSlow ? "https://lottie.host/7a942fa8-64cc-4a8f-a894-f8a6cc587108/ER9V3d0nfU.lottie" : "https://lottie.host/3b46fd6c-a7f6-4e67-b890-20cb64e89ed0/fmnycLWljb.lottie"}
                        loop
                        autoplay
                        style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}
                    />
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">Please wait ..</p>
                        {isSlow && (
                            <>
                                <p className="text-red-600 text-sm">Internet connection seems slow...</p>
                                <UnderlineButton
                                    href="/"
                                    target="_self"
                                    label="Go Back"
                                    textColor="text-black"
                                    underlineColor="bg-black"
                                    iconColor="text-black" />
                            </>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
}
