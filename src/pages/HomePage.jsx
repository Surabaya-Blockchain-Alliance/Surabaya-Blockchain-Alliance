import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CaseStudies, Footer, Hero, Process, Services, Team, CTA } from '../container';
import { Menu } from '../components';
import Loading from '../Loading'; // Make sure this path is correct

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
          <CTA />
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
