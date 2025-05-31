import React, { ReactNode, useState, useEffect } from "react";

interface DrawerItem {
    label: string;
    content: ReactNode;
}

interface DrawerProps {
    drawerItems: DrawerItem[];
    classActiveTab: string;
    classDeactiveTab: string;
    classParent: string;
    title: string;
}

const Drawer: React.FC<DrawerProps> = ({ drawerItems, classActiveTab, classDeactiveTab, classParent, title }) => {
    const [activeTab, setActiveTab] = useState(0); 
    const [titles, setTitles] = useState(drawerItems[0]?.label || ""); 

    useEffect(() => {
        setTitles(drawerItems[activeTab]?.label || "");
    }, [activeTab, drawerItems]);

    if (!drawerItems || drawerItems.length === 0) {
        return <div>No content available</div>;
    }

    return (
        <div className="drawer lg:drawer-open">
            <div className="drawer-content">
                <div className="flex flex-col h-auto w-full">
                    {/* Button container */}
                    <div className="flex items-center justify-center overflow-x-auto">
                        <ul className={`flex space-x-3 ${classParent}`}>
                            {drawerItems.map((item, index) => (
                                <li key={index} className="flex-none ">
                                    <button
                                        className={`text-xl ${activeTab === index ? `${classActiveTab}` : `${classDeactiveTab}`}`}
                                        onClick={() => setActiveTab(index)}
                                        aria-selected={activeTab === index}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* Content area */}
                    <div className="py-4 overflow-y-auto">
                        {drawerItems[activeTab]?.content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Drawer;
