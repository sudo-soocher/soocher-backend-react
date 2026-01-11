import React, { useState, useEffect } from "react";
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
  const [selectedDate, setSelectedDate] = useState(value || null);
  const [previousTime, setPreviousTime] = useState(null);

  const handleDateChange = (date) => {
    if (!date) return;
    
    // Check if this is a time selection (same date, different time)
    const isTimeSelection = selectedDate && 
                           selectedDate.getDate() === date.getDate() &&
                           selectedDate.getMonth() === date.getMonth() &&
                           selectedDate.getFullYear() === date.getFullYear() &&
                           (selectedDate.getHours() !== date.getHours() || 
                            selectedDate.getMinutes() !== date.getMinutes());
    
    setSelectedDate(date);
    onChange(date);
    
    // Only close popup if user selected a time (not just a date)
    if (isTimeSelection) {
      setIsOpen(false);
    } else {
      // Update previousTime for next comparison
      setPreviousTime(date);
    }
  };

  const handleDateSelect = (date) => {
    // Track the selected date when user clicks on a date in calendar
    // Don't close popup - let user select time
    if (date) {
      const selectedDateOnly = new Date(date);
      // Preserve existing time if available, otherwise set to midnight
      if (value && (value.getHours() !== 0 || value.getMinutes() !== 0)) {
        selectedDateOnly.setHours(value.getHours(), value.getMinutes(), 0, 0);
      } else {
        selectedDateOnly.setHours(0, 0, 0, 0);
      }
      setSelectedDate(selectedDateOnly);
      setPreviousTime(selectedDateOnly);
      // Don't call onChange here - let handleDateChange handle it when onChange fires
      // This prevents double updates and ensures proper time detection
    }
  };

  // Sync selectedDate when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
    }
  }, [value]);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(true);
      // Initialize selectedDate when opening
      if (value) {
        setSelectedDate(value);
        setPreviousTime(value);
      } else {
        // If no value, default to today so filterTime can work
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setSelectedDate(today);
        setPreviousTime(null);
      }
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

  // Filter out past times - only show times that haven't passed yet
  const filterTime = (time) => {
    if (!time) return true;
    
    const now = new Date();
    // Use selectedDate if available, otherwise use value, otherwise use today
    let dateToCheck = selectedDate;
    
    // If no selectedDate, try to use value
    if (!dateToCheck && value) {
      dateToCheck = new Date(value);
      dateToCheck.setHours(0, 0, 0, 0);
    }
    
    // If still no date, use today
    if (!dateToCheck) {
      dateToCheck = new Date();
      dateToCheck.setHours(0, 0, 0, 0);
    }
    
    // Create a date object for the selected date with the time being checked
    const timeToCheck = new Date(dateToCheck);
    timeToCheck.setHours(time.getHours());
    timeToCheck.setMinutes(time.getMinutes());
    timeToCheck.setSeconds(0);
    timeToCheck.setMilliseconds(0);
    
    // Check if the selected date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = 
      dateToCheck.getDate() === today.getDate() &&
      dateToCheck.getMonth() === today.getMonth() &&
      dateToCheck.getFullYear() === today.getFullYear();
    
    if (isToday) {
      // For today, only show times that are in the future (with a 15-minute buffer)
      const bufferMinutes = 15;
      const nowWithBuffer = new Date(now.getTime() + bufferMinutes * 60 * 1000);
      // Return true if time is after current time (with buffer), false otherwise
      const isFuture = timeToCheck.getTime() >= nowWithBuffer.getTime();
      return isFuture;
    }
    
    // For future dates, show all times
    return true;
  };

  // Calculate minTime and maxTime for today (react-datepicker requires both)
  const getTimeRestrictions = () => {
    const now = new Date();
    let dateToCheck = selectedDate;
    
    if (!dateToCheck && value) {
      dateToCheck = new Date(value);
      dateToCheck.setHours(0, 0, 0, 0);
    }
    
    if (!dateToCheck) {
      dateToCheck = new Date();
      dateToCheck.setHours(0, 0, 0, 0);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = 
      dateToCheck.getDate() === today.getDate() &&
      dateToCheck.getMonth() === today.getMonth() &&
      dateToCheck.getFullYear() === today.getFullYear();
    
    if (isToday) {
      // For today, set minTime to current time + 15 minutes buffer
      const bufferMinutes = 15;
      const minTime = new Date(now.getTime() + bufferMinutes * 60 * 1000);
      // Set maxTime to end of day (23:59)
      const maxTime = new Date();
      maxTime.setHours(23, 59, 0, 0);
      return { minTime, maxTime };
    }
    
    // For future dates, no time restrictions
    return null;
  };

  const timeRestrictions = getTimeRestrictions();

  // Format time to show range (e.g., "12:45 PM - 1:00 PM")
  const formatTimeWithRange = (timeString, intervalMinutes = 15) => {
    if (!timeString) return timeString;
    
    // Skip if already formatted with range
    if (timeString.includes(' - ')) return timeString;
    
    // Parse the time string (handles formats like "12:45 PM", "12:45:00 AM", "12:45:AM")
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
    if (!timeMatch) {
      // Try 24-hour format
      const timeMatch24 = timeString.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
      if (timeMatch24) {
        let hours = parseInt(timeMatch24[1], 10);
        const minutes = parseInt(timeMatch24[2], 10);
        const startHours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const startAmpm = hours >= 12 ? 'PM' : 'AM';
        const startTimeStr = `${startHours12}:${minutes.toString().padStart(2, '0')} ${startAmpm}`;
        
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate.getTime() + intervalMinutes * 60 * 1000);
        const endHours = endDate.getHours();
        const endMinutes = endDate.getMinutes();
        const endHours12 = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;
        const endAmpm = endHours >= 12 ? 'PM' : 'AM';
        const endTimeStr = `${endHours12}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;
        
        return `${startTimeStr} - ${endTimeStr}`;
      }
      return timeString;
    }
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format for calculation
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    // Calculate end time
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + intervalMinutes * 60 * 1000);
    
    // Format start time (preserve original format)
    const startHours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const startTimeStr = `${startHours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    // Format end time
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endHours12 = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;
    const endAmpm = endHours >= 12 ? 'PM' : 'AM';
    const endTimeStr = `${endHours12}:${endMinutes.toString().padStart(2, '0')} ${endAmpm}`;
    
    return `${startTimeStr} - ${endTimeStr}`;
  };

  // Update time list items to show ranges after render and ensure proper width
  useEffect(() => {
    if (isOpen) {
      const updateTimeListItems = () => {
        // Position navigation buttons correctly relative to header
        const header = document.querySelector('.datepicker-popup .react-datepicker__header--has-time-select') || 
                       document.querySelector('.datepicker-popup .react-datepicker__header');
        const currentMonth = document.querySelector('.datepicker-popup .react-datepicker__current-month');
        
        // Find all navigation buttons - search in entire popup
        const allNavButtons = document.querySelectorAll('.datepicker-popup .react-datepicker__navigation');
        let prevButton = null;
        let nextButton = null;
        
        allNavButtons.forEach((btn) => {
          if (btn.classList.contains('react-datepicker__navigation--previous')) {
            prevButton = btn;
          } else if (btn.classList.contains('react-datepicker__navigation--next')) {
            nextButton = btn;
          }
        });

        if (header) {
          // Ensure header has relative positioning
          header.style.position = 'relative';
          
          if (prevButton && nextButton) {
            // Move buttons into the header if they're not already there
            if (!header.contains(prevButton)) {
              header.appendChild(prevButton);
            }
            if (!header.contains(nextButton)) {
              header.appendChild(nextButton);
            }

            // Use simpler percentage-based positioning relative to header center
            // Previous button: left of center
            prevButton.style.cssText = `
              position: absolute !important;
              left: calc(50% - 70px) !important;
              right: auto !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              z-index: 100 !important;
              display: flex !important;
              visibility: visible !important;
              opacity: 1 !important;
              width: 32px !important;
              height: 32px !important;
              background: white !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 8px !important;
              cursor: pointer !important;
            `;

            // Next button: right of center
            nextButton.style.cssText = `
              position: absolute !important;
              left: calc(50% + 38px) !important;
              right: auto !important;
              top: 50% !important;
              transform: translateY(-50%) !important;
              z-index: 100 !important;
              display: flex !important;
              visibility: visible !important;
              opacity: 1 !important;
              width: 32px !important;
              height: 32px !important;
              background: white !important;
              border: 1px solid #e5e7eb !important;
              border-radius: 8px !important;
              cursor: pointer !important;
            `;

            // Hide buttons that appear in wrong locations (outside header)
            allNavButtons.forEach((btn) => {
              if (btn !== prevButton && btn !== nextButton) {
                if (!header.contains(btn)) {
                  btn.style.display = 'none';
                  btn.style.visibility = 'hidden';
                }
              }
            });
          }
        }

        // Ensure time container has proper width
        const timeContainer = document.querySelector('.react-datepicker__time-container');
        if (timeContainer) {
          timeContainer.style.width = '240px';
          timeContainer.style.minWidth = '240px';
          timeContainer.style.maxWidth = 'none';
          timeContainer.style.overflow = 'visible';
        }

        // Ensure time box and list containers allow overflow
        const timeBox = document.querySelector('.react-datepicker__time-box');
        if (timeBox) {
          timeBox.style.width = '100%';
          timeBox.style.maxWidth = 'none';
          timeBox.style.overflow = 'visible';
        }

        const timeList = document.querySelector('.react-datepicker__time-list');
        if (timeList) {
          timeList.style.overflowX = 'visible';
          timeList.style.maxWidth = 'none';
        }

        // Update time list items with ranges
        const timeListItems = document.querySelectorAll('.react-datepicker__time-list-item');
        timeListItems.forEach((item) => {
          const timeText = item.textContent.trim();
          // Check if it's already formatted or if it needs formatting
          if (timeText && !timeText.includes(' - ')) {
            const rangeText = formatTimeWithRange(timeText, timeIntervals);
            if (rangeText !== timeText && rangeText.includes(' - ')) {
              item.textContent = rangeText;
              // Ensure the item doesn't wrap and is fully visible
              item.style.whiteSpace = 'nowrap';
              item.style.overflow = 'visible';
              item.style.textOverflow = 'clip';
              item.style.width = 'auto';
              item.style.minWidth = '100%';
              item.style.maxWidth = 'none';
            }
          } else if (timeText.includes(' - ')) {
            // Already formatted, but ensure styles are applied
            item.style.whiteSpace = 'nowrap';
            item.style.overflow = 'visible';
            item.style.textOverflow = 'clip';
            item.style.width = 'auto';
            item.style.minWidth = '100%';
            item.style.maxWidth = 'none';
          }
        });
      };

      // Wait for DatePicker to render, then update time items
      // Use multiple timeouts to catch different render phases
      const timeoutId1 = setTimeout(updateTimeListItems, 50);
      const timeoutId2 = setTimeout(updateTimeListItems, 200);
      const timeoutId3 = setTimeout(updateTimeListItems, 500);
      
      // Also update on any DOM changes
      const observer = new MutationObserver(() => {
        setTimeout(updateTimeListItems, 50);
      });
      const popup = document.querySelector('.datepicker-popup');
      if (popup) {
        observer.observe(popup, { childList: true, subtree: true });
      }

      return () => {
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        clearTimeout(timeoutId3);
        observer.disconnect();
      };
    }
  }, [isOpen, timeIntervals, selectedDate]);

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
              onSelect={handleDateSelect}
              showTimeSelect={showTimeSelect}
              timeFormat={timeFormat}
              dateFormat={dateFormat}
              timeIntervals={timeIntervals}
              minDate={minDate}
              maxDate={maxDate}
              {...(timeRestrictions ? {
                minTime: timeRestrictions.minTime,
                maxTime: timeRestrictions.maxTime
              } : {})}
              disabled={disabled}
              filterTime={filterTime}
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
