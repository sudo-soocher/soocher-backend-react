import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { Calendar, Clock } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimePicker.css";

const DateTimePicker = ({
  value,
  onChange,
  placeholder = "Select date and time",
  disabled = false,
  error = false,
  className = "",
  minDate = null,
  maxDate = null,
  showTimeSelect = true,
  timeFormat = "HH:mm",
  dateFormat = "MMM dd, yyyy HH:mm",
  timeIntervals = 15,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const formatDisplayValue = (date) => {
    if (!date) return "";
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className={`datetime-picker-container ${className}`}>
      <div
        className={`datetime-picker-input ${error ? "error" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={handleInputClick}
      >
        <div className="input-content">
          <Calendar className="calendar-icon" size={18} />
          <span className="input-text">
            {value ? formatDisplayValue(value) : placeholder}
          </span>
          <Clock className="clock-icon" size={18} />
        </div>
      </div>

      {isOpen && (
        <div className="datepicker-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="datepicker-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <DatePicker
              selected={value}
              onChange={handleDateChange}
              showTimeSelect={showTimeSelect}
              timeFormat={timeFormat}
              dateFormat={dateFormat}
              timeIntervals={timeIntervals}
              minDate={minDate}
              maxDate={maxDate}
              disabled={disabled}
              inline
              {...props}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
