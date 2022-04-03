import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const DatePicker = ({ onClick, annotation, onDatePickerShow, dateFormat }) => {
  const dateRef = useRef(null);
  const dateContainerRef = useRef(null);
  useEffect(() => {
    let datePicker;
    const getDatePicker = async () => {
      datePicker = await window.Core.createDatePicker({
        field: dateRef.current,
        onClick,
        container: dateContainerRef.current,
        format: dateFormat ? dateFormat : 'dd-MM-yyyy',
      });
      onDatePickerShow(true);
    };
    getDatePicker();

    return () => {
      datePicker.destroy();
      datePicker = null;
      onDatePickerShow(false);
    };
  }, []);
  return (
    <div data-element="datePickerContainer">
      <div ref={dateRef} />
      <div ref={dateContainerRef}/>
    </div>
  );
};

DatePicker.propTypes = {
  onClick: PropTypes.func.isRequired,
  annotation: PropTypes.object.isRequired,
  onDatePickerShow: PropTypes.func.isRequired
};

export default DatePicker;

