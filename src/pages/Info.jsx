import React from 'react';
import { Link } from 'react-router-dom';
import { useInfoData, useSettingsData } from '../hooks/useStrapiData';
import PageLayout from '../components/layout/PageLayout';
import InfoItem from '../components/InfoItem';

const Info = () => {
  const { data: response } = useInfoData();
  const infoData = response?.data || [];
  const { data: settingResponse } = useSettingsData();
  const settingsData = settingResponse?.data || [];

  return (
    <PageLayout>
      <div className="space-y-6">
        {infoData.map((item) => (
              <InfoItem
                key={item.id}
                year={item.Year}
                title={item.Title}
                subtitle={item.SubTitle}
                className="dark:text-white"
              />
        ))}
      </div>
      
      <div className="flex flex-col space-y-2 mt-16">
        {settingsData?.Menu?.map((menuItem) => (
          <div key={menuItem.id} className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white">
            <Link
              to={menuItem.Link.startsWith('http') ? menuItem.Link : `/${menuItem.Link}`} 
              target={menuItem.Target}
              className="hover:text-[#6366f1] flex items-center"
            >
              <span className={`mr-2 transform ${menuItem.Link.startsWith('http') ? '-rotate-45' : ''}`}>→</span>
              {menuItem.Name}
            </Link>
          </div>
        ))}
        <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white">
          
          <Link to="/awards" className="hover:text-[#6366f1]">
            <span className="mr-2">→</span>
            Awards
          </Link>
        </div>
        <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white">
          
          <Link to="/" className="hover:text-[#6366f1]">
            <span className="mr-2">←</span>
            Back
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Info;