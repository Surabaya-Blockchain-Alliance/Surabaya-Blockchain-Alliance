import React from "react";

const LogoIcon: React.FC<{ size?: number }> = ({ size = 50 }) => (
    <img src="https://ugc.production.linktr.ee/FzVBkJvRFWQqZrverjmA_H2b85zgTrB8ByBMp?io=true&size=avatar-v3_0" className="rounded-full" style={{ width: `${size}px`, height: `${size}px` }} alt="" />
);

export default LogoIcon; 