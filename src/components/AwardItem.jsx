import React from 'react';
import PropTypes from 'prop-types';

const AwardItem = ({ name }) => {
  return (
    <div className="flex items-center text-[16px] md:text-[16pt]">
      <span className="text-black dark:text-white">
        {name}
      </span>
    </div>
  );
};

AwardItem.propTypes = {
  name: PropTypes.string.isRequired,
};

export default AwardItem;