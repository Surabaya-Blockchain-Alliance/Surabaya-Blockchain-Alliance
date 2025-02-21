import React from "react";

interface ButtonBaseProps {
    label: string;
    cn: string;
    onClick?: () => void;
    children?: React.ReactNode;
}

const ButtonBase: React.FC<ButtonBaseProps> = ({cn, label, onClick, children}) => {
    return (
        <button className={cn} onClick={onClick}>
            {children || label}
        </button>
    );
};

export default ButtonBase