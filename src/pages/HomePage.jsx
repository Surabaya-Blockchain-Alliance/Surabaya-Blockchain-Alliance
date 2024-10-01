import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CaseStudies, Footer, Hero, Process, Services, Team } from '../container';
import { Menu } from '../components';
import Loading from '../Loading'; 

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="container">
          <Menu />
          <Hero />
          <Services />
          <CaseStudies />
          <Process />
          <Team />
          <Footer />
        </div>    
      )}
    </>
  );
};

export default HomePage;
