import { useEffect, useState } from "react";

interface AlertMessageProps {
    message: string;
}

export default function AlertMessage({ message }: AlertMessageProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) return;
        setVisible(true);
        const timer = setTimeout(() => setVisible(false), 5000);
        return () => clearTimeout(timer);
    }, [message]);

    if (!visible || !message) return null;

    let alertClass = "alert alert-info alert-soft";

    // Dynamically assign alert type based on emoji prefix
    if (message.startsWith("✅")) {
        alertClass = "alert alert-sm alert-success alert-soft";
    } else if (message.startsWith("❌")) {
        alertClass = "alert alert-sm alert-error alert-soft";
    } else if (
        message.startsWith("⚠️") ||
        message.startsWith("🟡") ||
        message.startsWith("⛔")
    ) {
        alertClass = "alert alert-sm alert-warning alert-soft";
    } else if (message.startsWith("⏳")) {
        alertClass = "alert alert-sm alert-info alert-soft";
    }

    // Remove the emoji prefix before rendering
    const displayMessage = message.replace(/^[^\w\d]+/, "").trim();

    return (
        <div role="alert" className={`${alertClass} animate-pulse py-5`}>
            <span className="font-semibold">{displayMessage}</span>
        </div>
    );
}
