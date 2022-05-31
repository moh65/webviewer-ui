//customization-new-file
import React from 'react';
import PropTypes from 'prop-types';

import './Tag.scss';

const Tag = ({ label, value }) => {

  // eslint-disable-next-line no-unused-vars
  const [id, color] = value.split('-');

  // Helper function to get the text color of the tag
  function pickTextColorBasedOnBgColorSimple(bgColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 150) ? '#000000' : '#FFFFFF';
  }

  const textColor = pickTextColorBasedOnBgColorSimple(color);

  return (
    <div className="custom-tag" style={{ backgroundColor: color, color: textColor }}>
      {label}
    </div>
  );
};

Tag.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default Tag;
