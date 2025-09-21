"use client";
import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "Select date and time",
  required = false,
  minDate,
  maxDate,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [selectedTime, setSelectedTime] = useState(() => {
    if (value) {
      const date = new Date(value);
      return {
        hours: date.getHours() > 12 ? date.getHours() - 12 : date.getHours() || 12,
        minutes: date.getMinutes(),
        ampm: date.getHours() >= 12 ? "PM" : "AM",
      };
    } else {
      const now = new Date();
      return {
        hours: now.getHours() > 12 ? now.getHours() - 12 : now.getHours() || 12,
        minutes: now.getMinutes(),
        ampm: now.getHours() >= 12 ? "PM" : "AM",
      };
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplayValue = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for date comparison
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    if (minDate) {
      const minDateObj = new Date(minDate);
      minDateObj.setHours(0, 0, 0, 0); // Reset time to start of day
      if (checkDate < minDateObj) return true;
    }
    
    if (maxDate) {
      const maxDateObj = new Date(maxDate);
      maxDateObj.setHours(23, 59, 59, 999); // Set to end of day
      if (checkDate > maxDateObj) return true;
    }
    
    return false;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (isDateDisabled(newDate)) return;
    setSelectedDate(newDate);
  };

  const handleTimeChange = (field: "hours" | "minutes" | "ampm", value: string | number) => {
    setSelectedTime(prev => ({ ...prev, [field]: value }));
  };

  const applyDateTime = () => {
    if (!selectedDate) return;

    let hours = selectedTime.hours;
    if (selectedTime.ampm === "AM" && hours === 12) hours = 0;
    if (selectedTime.ampm === "PM" && hours !== 12) hours += 12;

    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours, selectedTime.minutes, 0, 0);

    onChange(finalDate.toISOString());
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isSelected = selectedDate && 
        date.getFullYear() === selectedDate.getFullYear() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getDate() === selectedDate.getDate();
      const isDisabled = isDateDisabled(date);
      const isToday = 
        date.getFullYear() === new Date().getFullYear() &&
        date.getMonth() === new Date().getMonth() &&
        date.getDate() === new Date().getDate();

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isDisabled}
          className={`
            p-1 text-xs rounded-md transition-colors w-8 h-8 flex items-center justify-center
            ${isSelected 
              ? "bg-blue-600 text-white" 
              : isToday
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }
            ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef} style={{ zIndex: 1 }}>
      {label && (
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-[#171717] text-gray-800 dark:text-gray-200 flex items-center justify-between hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        <span className={selectedDate ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}>
          {selectedDate ? formatDisplayValue(selectedDate) : placeholder}
        </span>
        <Calendar size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-[#171717] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] p-3 w-80 max-w-full"
             style={{ position: 'absolute', zIndex: 9999 }}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft size={14} />
            </button>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {viewDate.toLocaleString("en-US", { month: "short", year: "numeric" })}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <div key={index} className="p-1 text-xs font-medium text-gray-500 dark:text-gray-400 text-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {renderCalendar()}
          </div>

          {/* Time Picker */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Time</span>
            </div>
            
            <div className="flex items-center gap-1">
              <select
                value={selectedTime.hours}
                onChange={(e) => handleTimeChange("hours", parseInt(e.target.value))}
                className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-[#171717] text-gray-800 dark:text-gray-200 flex-1"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
              
              <span className="text-gray-500 text-xs">:</span>
              
              <select
                value={selectedTime.minutes}
                onChange={(e) => handleTimeChange("minutes", parseInt(e.target.value))}
                className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-[#171717] text-gray-800 dark:text-gray-200 flex-1"
              >
                {[0, 15, 30, 45].map(minute => (
                  <option key={minute} value={minute}>{minute.toString().padStart(2, '0')}</option>
                ))}
              </select>
              
              <select
                value={selectedTime.ampm}
                onChange={(e) => handleTimeChange("ampm", e.target.value)}
                className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-[#171717] text-gray-800 dark:text-gray-200 flex-1"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyDateTime}
              disabled={!selectedDate}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;