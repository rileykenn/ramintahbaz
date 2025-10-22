import React from 'react';
import PropTypes from 'prop-types';

const InfoItem = ({ year, title, companyLocation }) => (
  <div className="">
    <h3 className="text-[16px] md:text-[16pt] text-black dark:text-white">{title}</h3>
    <p className="text-[16px] md:text-[16pt] text-black dark:text-white">{companyLocation}</p>
    <p className="text-[16px] md:text-[16pt] text-black dark:text-white mb-2">{year}</p>
  </div>
);

InfoItem.propTypes = {
  title: PropTypes.string.isRequired,
  companyLocation: PropTypes.string.isRequired,
  year: PropTypes.string.isRequired,
};

export default InfoItem;