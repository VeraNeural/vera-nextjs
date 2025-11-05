import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-semibold text-text-primary mb-2"
          >
            {label}
          </label>
        )}

        {/* Textarea Field */}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 
            bg-bg-tertiary text-text-primary placeholder-text-tertiary
            rounded-xl border
            ${hasError ? 'border-trial-red focus:ring-trial-red' : 'border-border-color focus:ring-orb-purple'}
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors resize-none
            ${className}
          `}
          {...props}
        />

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            className={`mt-2 text-sm ${
              hasError ? 'text-trial-red' : 'text-text-tertiary'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
