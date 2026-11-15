import { useId, type ComponentPropsWithoutRef } from 'react';
interface OutlineInputFieldProps extends ComponentPropsWithoutRef<'input'> {
  errorMsg?: string;
  rounded?: 'md' | 'lg' | 'xl' | 'none';
}
const roundedClasses = {
  none: 'ui-rounded-none',
  md: 'ui-rounded-md',
  lg: 'ui-rounded-lg',
  xl: 'ui-rounded-xl',
};
const OutlineInputField = ({
  errorMsg,
  rounded = 'none',
  className = '',
  id,
  ...props
}: OutlineInputFieldProps) => {
  const generated = useId(),
    errorId = `${id || generated}-error`;
  const describedBy =
    [props['aria-describedby'], errorMsg ? errorId : undefined].filter(Boolean).join(' ') ||
    undefined;
  return (
    <div className="ui-field">
      <input
        {...props}
        id={id}
        className={`ui-control ${roundedClasses[rounded]} ${className}`}
        aria-invalid={errorMsg ? true : props['aria-invalid']}
        aria-describedby={describedBy}
      />
      {errorMsg && (
        <p id={errorId} className="ui-field-error" aria-live="polite">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
export default OutlineInputField;
