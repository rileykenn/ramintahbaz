import React from 'react';
import { Link } from 'react-router-dom';
import { useSettingsData } from '../hooks/useStrapiData'; // keep only settings for now
import { useExperiencesSupabase } from '../hooks/useExperiencesSupabase';
import PageLayout from '../components/layout/PageLayout';
import InfoItem from '../components/InfoItem';
import { Helmet } from 'react-helmet-async';

const About = () => {
  const { data: experiences, loading, error } = useExperiencesSupabase();
  const { data: settingResponse } = useSettingsData();
  const settingsData = settingResponse?.data || [];

  if (loading) return null; // you can add your own spinner if wanted
  if (error) return <div>Error loading about.</div>;

  // --- EXTRA LINKS TO APPEND (will not duplicate if already present)
  const extraLinks = [
    {
      id: 'external-x',
      Link: 'https://x.com/ramintahbaz',
      Name: 'X',
      Target: '_blank',
    },
    {
      id: 'external-linkedin',
      Link: 'https://www.linkedin.com/in/ramin-tahbaz/',
      Name: 'LinkedIn',
      Target: '_blank',
    },
    {
      id: 'external-imdb',
      Link: 'https://www.imdb.com/name/nm11702949/',
      Name: 'iMDb',
      Target: '_blank',
    },
  ];

  // Merge menu from settings with extraLinks (avoid duplicates by Link)
  const originalMenu = settingsData?.Menu || [];
  const existingLinks = new Set(originalMenu.map((m) => String(m.Link).toLowerCase()));
  const mergedMenu = [
    ...originalMenu,
    ...extraLinks.filter((e) => !existingLinks.has(String(e.Link).toLowerCase())),
  ];

  return (
    <>
      <Helmet>
        <title>{'About'}</title>
        <meta property="og:title" content={'About'} />
        <meta property="og:type" content="website" />
      </Helmet>

      <PageLayout>
        <div className="space-y-10">
          {experiences.map((item) => (
            <InfoItem
              key={item.id}
              year={item.year}
              title={item.title}
              companyLocation={item.company_location}
              className="dark:text-white"
            />
          ))}
        </div>

        <div className="flex flex-col space-y-2 mt-16">
          {mergedMenu.map((menuItem) => (
            <div
              key={menuItem.id}
              className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white"
            >
              {/* Keep same rendering pattern as before — external links use full URL */}
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
            <Link to="/awards" className="hover:text-[#6366f1]">[ Awards ]</Link>
          </div>

          <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white">
            <Link to="/" className="hover:text-[#6366f1]">[ Back ]</Link>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default About;
