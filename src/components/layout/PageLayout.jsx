import React from 'react';
import Layout from './Layout';

const PageLayout = ({ children }) => {
  return (
    <Layout>
      <div className="flex flex-col">
        {children}
      </div>
    </Layout>
  );
};

export default PageLayout;
