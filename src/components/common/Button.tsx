import type { ComponentPropsWithoutRef } from 'react';
interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'icon' | 'link' | 'socialLogin' | 'text';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-primary-300 text-primary-900 active:bg-primary-400',
    secondary: 'bg-secondary-50 text-secondary-700 active:bg-secondary-100',
    tertiary: 'bg-gray-100 text-gray-700 active:bg-gray-200',
    icon: 'bg-transparent text-ui-ink',
    link: 'bg-transparent text-ui-muted',
    text: 'bg-transparent text-ui-ink',
    socialLogin: 'border',
  };
  return (
    <button
      type="button"
      className={`ui-button ui-button-${size} ui-button-${variant} ${variants[variant]} ${fullWidth ? 'w-full' : 'w-fit'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
