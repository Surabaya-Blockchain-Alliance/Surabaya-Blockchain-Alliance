'use client';
import { Typewriter } from 'react-simple-typewriter';

const AnimatedText = ({ words }) => {
    return (
        <h1 className="text-6xl font-light text-left text-black">
            <Typewriter
                words={words}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
            />
             <span className="font-bold">Your Project’s Reach!</span>
        </h1>
    );
};

export default AnimatedText;
