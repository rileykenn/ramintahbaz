import React from 'react';
import { Link } from 'react-router-dom';
import { useInfoData, useSettingsData } from '../hooks/useStrapiData';
import PageLayout from '../components/layout/PageLayout';
import InfoItem from '../components/InfoItem';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const { data: response } = useInfoData();
  const infoData = response?.data || [];
  const { data: settingResponse } = useSettingsData();
  const settingsData = settingResponse?.data || [];

  // Sort infoData based on OrderNo
  const sortedInfoData = [...infoData].sort((a, b) => a.OrderNo - b.OrderNo);

  return (
    <>
      <Helmet>
        <title>{'About'}</title>
        <meta
          property="og:title"
          content={'About'}
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <PageLayout>
        <div className="space-y-10">
          {sortedInfoData.map((item) => (
            <InfoItem
              key={item.id}
              year={item.Year}
              title={item.Title}
              companyLocation={item.Company_Location}
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
                [ {menuItem.Link.startsWith('http') ? `${menuItem.Name} *` : menuItem.Name} ]
              </Link>
            </div>
          ))}
          <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white">

            <Link to="/awards" className="hover:text-[#6366f1]">
              [ Awards ]
            </Link>
          </div>
          <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white">

            <Link to="/" className="hover:text-[#6366f1]">
              [ Back ]
            </Link>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default About;