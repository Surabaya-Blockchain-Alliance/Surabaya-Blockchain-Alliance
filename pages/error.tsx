import UnderlineButton from '@/components/button/underlined';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type ErrorPageProps = {
  error?: string;
};

export default function ErrorPage({ error }: ErrorPageProps) {
  return (
    <section className="min-h-screen mx-auto bg-white items-center justify-center flex px-4">
      <div className="text-black max-w-xl w-full">
        <div className="space-y-10 text-center">
          <DotLottieReact
            src="https://lottie.host/7a942fa8-64cc-4a8f-a894-f8a6cc587108/ER9V3d0nfU.lottie"
            loop
            autoplay
            style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}
          />
          <div className="space-y-2">
            <p className="text-lg">{error || "Something went wrong."}</p>
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
