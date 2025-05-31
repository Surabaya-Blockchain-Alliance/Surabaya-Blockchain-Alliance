import React from 'react';
import '../../styles/blobs.css'; 

const AnimatedBlobs: React.FC = () => {
  return (
    <>
      <div className="shape bg-pink-400 absolute top-0 -left-4 w-72 h-72 rounded-full filter blur-xl opacity-70 mix-blend-multiply blob"></div>
      <div className="shape bg-yellow-400 absolute top-0 -right-4 w-72 h-72 rounded-full filter blur-xl opacity-70 mix-blend-multiply blob animation-delay-2000"></div>
      <div className="shape bg-violet-400 absolute -bottom-8 left-20 w-72 h-72 rounded-full filter blur-xl opacity-70 mix-blend-multiply blob animation-delay-4000"></div>
    </>
  );
};

export default AnimatedBlobs;
