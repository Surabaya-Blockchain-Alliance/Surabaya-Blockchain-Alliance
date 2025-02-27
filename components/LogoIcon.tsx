import React from "react";

const LogoIcon: React.FC<{ src?:string,  size?: number }> = ({ src, size = 50 }) => (
    <img src={src} className="rounded-full" style={{ width: `${size}px`, height: `${size}px` }} alt="" />
);

export default LogoIcon; 