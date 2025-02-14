import Link from "next/link";
import { useEffect } from "react";
import { BsArrowRight } from "react-icons/bs";

export default function InfinityBackground() {
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
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

    const bgImage =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAIAAACRXR/mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABnSURBVHja7M5RDYAwDEXRDgmvEocnlrQS2SwUFST9uEfBGWs9c97nbGtDcquqiKhOImLs/UpuzVzWEi1atGjRokWLFi1atGjRokWLFi1atGjRokWLFi1af7Ukz8xWp8z8AAAA//8DAJ4LoEAAlL1nAAAAAElFTkSuQmCC";

    return (
        <div
            className="w-full h-lvh flex items-center justify-center text-gray-800"
            style={{
                fontFamily: 'Exo, Ubuntu, "Segoe UI", Helvetica, Arial, sans-serif',
                background: `url(${bgImage}) repeat 0 0`,
                animation: "bg-scrolling-reverse 0.92s linear infinite",
            }}
        >
            <h1 className="text-5xl font-semibold">Cardano Hub Indonesia</h1>
        </div>
    );
}
