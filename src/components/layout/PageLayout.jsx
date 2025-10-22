import React from 'react';
//import useWindowResize from '../../hooks/useWindowResize';
import Layout from './Layout';
const PageLayout = ({ children }) => {
  //const { windowSize, baseUnit } = useWindowResize();

  return (
    <Layout>
      <div 
        className="flex flex-col"
        style={{ 
         // '--base-unit': `${baseUnit}px`
        }}
      >
        {children}
      </div>
    </Layout>
  );
};

export default PageLayout;