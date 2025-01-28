import Link from "next/link";
import React from "react";

interface ButtonBaseProps {
    label: string;
    cn: string;
}

const ButtonBase: React.FC<ButtonBaseProps> = ({cn, label}) => {
    return (
        <button className={cn}>{label}</button>
    );
};

export default ButtonBase