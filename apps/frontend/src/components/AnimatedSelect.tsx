"use client";
import React, { useState } from "react";
import { LucideIcon, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface AnimatedSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  error?: string;
  className?: string;
  name?: string;
}

const AnimatedSelect: React.FC<AnimatedSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  icon: Icon,
  error,
  className = "",
  name,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = !!value;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const isFloating = isFocused || hasValue;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Select Field */}
        <select
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={`
            w-full px-3 py-3 text-sm border-2 rounded-md bg-white dark:bg-[#171717] 
            text-gray-800 dark:text-gray-200 transition-all duration-200 ease-in-out
            appearance-none cursor-pointer
            ${Icon ? "pl-10" : ""}
            pr-10
            ${isFocused
              ? "border-blue-500 dark:border-blue-400"
              : error
              ? "border-red-500 dark:border-red-400"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${!hasValue ? "text-gray-500 dark:text-gray-400" : ""}
            focus:outline-none
          `}
        >
          <option value="" disabled hidden>
            {/* Empty option for placeholder */}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-800 dark:text-gray-200">
              {option.label}
            </option>
          ))}
        </select>

        {/* Floating Label */}
        <label
          className={`
            absolute left-3 transition-all duration-200 ease-in-out pointer-events-none
            ${Icon ? "left-10" : "left-3"}
            ${isFloating
              ? "top-0 -translate-y-1/2 text-xs px-1 bg-white dark:bg-[#171717]"
              : "top-1/2 -translate-y-1/2 text-sm"
            }
            ${isFocused
              ? "text-blue-600 dark:text-blue-400"
              : error
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
            }
            ${disabled ? "opacity-50" : ""}
          `}
        >
          {isFloating || !hasValue ? label : placeholder}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Icon */}
        {Icon && (
          <Icon
            size={16}
            className={`
              absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200
              ${isFocused
                ? "text-blue-600 dark:text-blue-400"
                : error
                ? "text-red-600 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
              }
              ${disabled ? "opacity-50" : ""}
            `}
          />
        )}

        {/* Dropdown Arrow */}
        <ChevronDown
          size={16}
          className={`
            absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none
            ${isFocused
              ? "text-blue-600 dark:text-blue-400 rotate-180"
              : error
              ? "text-red-600 dark:text-red-400"
              : "text-gray-400 dark:text-gray-500"
            }
            ${disabled ? "opacity-50" : ""}
          `}
        />

        {/* Focus Ring Animation */}
        <div
          className={`
            absolute inset-0 rounded-md pointer-events-none transition-all duration-200 ease-in-out
            ${isFocused ? "shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20" : ""}
          `}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top-1 duration-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default AnimatedSelect;