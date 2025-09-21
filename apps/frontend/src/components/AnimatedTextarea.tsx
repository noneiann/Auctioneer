"use client";
import React, { useState, useRef, useEffect } from "react";
import { LucideIcon } from "lucide-react";

interface AnimatedTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  error?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  name?: string;
}

const AnimatedTextarea: React.FC<AnimatedTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  error,
  className = "",
  rows = 4,
  maxLength,
  name,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setHasValue(!!value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setHasValue(!!newValue);
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
        {/* Textarea Field */}
        <textarea
          ref={textareaRef}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={isFloating ? placeholder : ""}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full px-3 py-3 text-sm border-2 rounded-md bg-white dark:bg-[#171717] 
            text-gray-800 dark:text-gray-200 transition-all duration-200 ease-in-out
            resize-vertical min-h-[100px]
            ${Icon ? "pl-10" : ""}
            ${isFocused
              ? "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20"
              : error
              ? "border-red-500 dark:border-red-400"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            focus:outline-none
          `}
        />

        {/* Floating Label */}
        <label
          className={`
            absolute left-3 transition-all duration-200 ease-in-out pointer-events-none
            ${Icon ? "left-10" : "left-3"}
            ${isFloating
              ? "top-0 -translate-y-1/2 text-xs px-1 bg-white dark:bg-[#171717]"
              : "top-4 text-sm"
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
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Icon */}
        {Icon && (
          <Icon
            size={16}
            className={`
              absolute left-3 top-4 transition-colors duration-200
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
      </div>

      {/* Character Count and Error */}
      <div className="flex justify-between items-start mt-1">
        {error && (
          <div className="text-xs text-red-600 dark:text-red-400 animate-in slide-in-from-top-1 duration-200">
            {error}
          </div>
        )}
        {maxLength && (
          <div className={`text-xs ml-auto ${
            value.length > maxLength * 0.9 
              ? "text-amber-600 dark:text-amber-400" 
              : "text-gray-400 dark:text-gray-500"
          }`}>
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedTextarea;