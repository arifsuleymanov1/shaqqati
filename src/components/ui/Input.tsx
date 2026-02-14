"use client";

import React, { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftAddon, className = "", type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none text-surface-500 text-sm">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={`
              w-full px-4 py-2.5 rounded-lg border transition-all duration-200
              text-surface-900 text-sm placeholder:text-surface-400
              focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500
              disabled:bg-surface-100 disabled:cursor-not-allowed
              ${leftAddon ? "pl-12" : ""}
              ${isPassword ? "pr-11" : ""}
              ${error ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-surface-300"}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-surface-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
