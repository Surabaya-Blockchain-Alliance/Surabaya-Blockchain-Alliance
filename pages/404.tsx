import UnderlineButton from '@/components/button/underlined';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Custom404() {
    return (
        <section className="min-h-screen mx-auto bg-white items-center justify-center flex">
            <div className="text-black">
                <div className="space-y-10 text-center">
                    <DotLottieReact
                        src="https://lottie.host/7a942fa8-64cc-4a8f-a894-f8a6cc587108/ER9V3d0nfU.lottie"
                        loop
                        autoplay
                        style={{ width: "100%", maxWidth: "100%", margin: "0 auto" }}
                    />
                    <div className="space-y-1">
                        <p>The page you're looking for does not exist.</p>
                        <UnderlineButton
                            href="/"
                            target="_self"
                            label="Go Back Home"
                            textColor="text-black"
                            underlineColor="bg-black"
                            iconColor="text-black"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
