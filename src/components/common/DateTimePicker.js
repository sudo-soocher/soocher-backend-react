import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
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
  excludeTimes = [], // Array of Date objects representing booked/unavailable times
  onDateChange = null, // Callback when date changes (to fetch booked times)
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || null);
  const [previousTime, setPreviousTime] = useState(null);

  const handleDateChange = (date) => {
    if (!date) return;
    
    // Ensure date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date received in handleDateChange:', date);
      return;
    }
    
    try {
      // Check if this is a time selection (same date, different time)
      const isTimeSelection = selectedDate && 
                             selectedDate instanceof Date &&
                             !isNaN(selectedDate.getTime()) &&
                             selectedDate.getDate() === date.getDate() &&
                             selectedDate.getMonth() === date.getMonth() &&
                             selectedDate.getFullYear() === date.getFullYear() &&
                             (selectedDate.getHours() !== date.getHours() || 
                              selectedDate.getMinutes() !== date.getMinutes());
      
      // Create a new date object to avoid reference issues, especially for month boundaries
      const newDate = new Date(date);
      setSelectedDate(newDate);
      
      // Call onChange with valid date
      if (onChange && typeof onChange === 'function') {
        onChange(newDate);
      }
      
      // Only close popup if user selected a time (not just a date)
      if (isTimeSelection) {
        setIsOpen(false);
      } else {
        // Update previousTime for next comparison
        setPreviousTime(newDate);
      }
    } catch (error) {
      console.error('Error in handleDateChange:', error, date);
    }
  };

  const handleDateSelect = (date) => {
    // Track the selected date when user clicks on a date in calendar
    // Don't close popup - let user select time
    if (!date) return;
    
    // Ensure date is valid
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date received in handleDateSelect:', date);
      return;
    }
    
    try {
      const selectedDateOnly = new Date(date);
      
      // Preserve existing time if available, otherwise set to midnight
      if (value && value instanceof Date && !isNaN(value.getTime()) && 
          (value.getHours() !== 0 || value.getMinutes() !== 0)) {
        selectedDateOnly.setHours(value.getHours(), value.getMinutes(), 0, 0);
      } else {
        selectedDateOnly.setHours(0, 0, 0, 0);
      }
      
      // Ensure the resulting date is still valid
      if (isNaN(selectedDateOnly.getTime())) {
        console.error('Invalid date after time setting:', selectedDateOnly);
        return;
      }
      
      setSelectedDate(selectedDateOnly);
      setPreviousTime(selectedDateOnly);
      
      // Notify parent of date change so they can fetch booked times
      if (onDateChange && typeof onDateChange === 'function') {
        onDateChange(selectedDateOnly);
      }
      
      // Don't call onChange here - let handleDateChange handle it when onChange fires
      // This prevents double updates and ensures proper time detection
    } catch (error) {
      console.error('Error in handleDateSelect:', error, date);
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

  // Filter out past times and booked times
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
    
    // Check if this time is in the excludeTimes list (booked times)
    if (excludeTimes && excludeTimes.length > 0) {
      const isExcluded = excludeTimes.some((excludedTime) => {
        if (!excludedTime || !(excludedTime instanceof Date)) return false;
        
        // Compare date, hours, and minutes to ensure we're comparing the same day
        const sameDate = 
          excludedTime.getDate() === dateToCheck.getDate() &&
          excludedTime.getMonth() === dateToCheck.getMonth() &&
          excludedTime.getFullYear() === dateToCheck.getFullYear();
        
        const sameTime = 
          excludedTime.getHours() === time.getHours() &&
          excludedTime.getMinutes() === time.getMinutes();
        
        return sameDate && sameTime;
      });
      if (isExcluded) {
        return false; // This time is booked, don't show it
      }
    }
    
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
    
    // For future dates, show all times (that aren't excluded)
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
        // Always query for fresh references to avoid stale DOM nodes
        const popup = document.querySelector('.datepicker-popup');
        if (!popup) return; // Exit early if popup doesn't exist

        // Ensure time container has proper width and no spacing
        const timeContainer = document.querySelector('.react-datepicker__time-container');
        if (timeContainer) {
          timeContainer.style.width = '240px';
          timeContainer.style.minWidth = '240px';
          timeContainer.style.maxWidth = 'none';
          timeContainer.style.overflow = 'visible';
          timeContainer.style.margin = '0';
          timeContainer.style.marginLeft = '0';
          timeContainer.style.padding = '0';
        }

        // Remove spacing between month and time containers
        const monthContainer = document.querySelector('.react-datepicker__month-container');
        if (monthContainer) {
          monthContainer.style.margin = '0';
          monthContainer.style.marginRight = '0';
          monthContainer.style.padding = '0';
        }

        // Ensure react-datepicker container has no gap
        const datepickerContainer = document.querySelector('.datepicker-popup .react-datepicker__container');
        if (datepickerContainer) {
          datepickerContainer.style.gap = '0';
          datepickerContainer.style.margin = '0';
          datepickerContainer.style.padding = '0';
        }

        const datepicker = document.querySelector('.datepicker-popup .react-datepicker');
        if (datepicker) {
          datepicker.style.gap = '0';
          datepicker.style.margin = '0';
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
      // Start with longer delays to ensure buttons are rendered by react-datepicker
      const timeoutId1 = setTimeout(updateTimeListItems, 100);
      const timeoutId2 = setTimeout(updateTimeListItems, 300);
      const timeoutId3 = setTimeout(updateTimeListItems, 600);
      const timeoutId4 = setTimeout(updateTimeListItems, 1000); // Extra delay for button rendering
      
      // Also update on any DOM changes, but be careful not to interfere with React
      const observer = new MutationObserver((mutations) => {
        // Only update if the mutations don't involve React removing nodes
        const hasRemovals = mutations.some(m => m.removedNodes.length > 0);
        if (!hasRemovals) {
          setTimeout(updateTimeListItems, 50);
        } else {
          // If nodes are being removed, wait a bit longer to let React finish
          setTimeout(updateTimeListItems, 100);
        }
      });
      const popup = document.querySelector('.datepicker-popup');
      if (popup) {
        observer.observe(popup, { 
          childList: true, 
          subtree: true,
          attributes: false // Don't watch attribute changes to reduce interference
        });
      }

      return () => {
        // Clean up timeouts
        clearTimeout(timeoutId1);
        clearTimeout(timeoutId2);
        clearTimeout(timeoutId3);
        if (typeof timeoutId4 !== 'undefined') clearTimeout(timeoutId4);
        
        // Disconnect observer to prevent interference with React's DOM operations
        if (observer) {
          observer.disconnect();
        }
        
        // Reset any inline styles we may have applied to prevent stale references
        // This helps when navigating between months
        try {
          const allNavButtons = document.querySelectorAll('.datepicker-popup .react-datepicker__navigation');
          allNavButtons.forEach((btn) => {
            if (btn && btn.parentNode) {
              // Reset positioning to let React handle it naturally
              btn.style.cssText = '';
            }
          });
        } catch (e) {
          // Ignore errors during cleanup
        }
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
              renderCustomHeader={({
                date,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => (
                <div className="custom-header">
                  <button
                    type="button"
                    className="nav-button nav-button-prev"
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="current-month">
                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    className="nav-button nav-button-next"
                    onClick={increaseMonth}
                    disabled={nextMonthButtonDisabled}
                    aria-label="Next month"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              {...props}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
