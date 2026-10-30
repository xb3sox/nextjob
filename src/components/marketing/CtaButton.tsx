import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type CtaButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type CtaButtonSize = 'sm' | 'md' | 'lg';

export interface CtaButtonBaseProps {
  variant?: CtaButtonVariant;
  size?: CtaButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children: ReactNode;
  className?: string;
}

export type CtaButtonAsButtonProps = CtaButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CtaButtonBaseProps> & {
    href?: undefined;
  };

export type CtaButtonAsAnchorProps = CtaButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CtaButtonBaseProps> & {
    href: string;
  };

export type CtaButtonProps = CtaButtonAsButtonProps | CtaButtonAsAnchorProps;

const variantClasses: Record<CtaButtonVariant, string> = {
  primary: 'mkt-btn-primary font-semibold shadow-[0_0_30px_-8px_rgba(52,211,153,0.4)]',
  secondary: 'mkt-btn-secondary font-medium',
  outline: 'mkt-btn-outline font-medium hover:bg-white/5',
  ghost: 'text-fog hover:text-paper font-medium hover:bg-white/5',
};

const sizeClasses: Record<CtaButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3.5 text-base rounded-lg gap-2.5',
};

export function CtaButton({
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  children,
  className = '',
  ...props
}: CtaButtonProps) {
  const baseClass =
    `inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50 disabled:pointer-events-none ${
      variantClasses[variant]
    } ${sizeClasses[size]} ${className}`.trim();

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </>
  );

  if (props.href !== undefined) {
    const { href, ...anchorProps } = props as CtaButtonAsAnchorProps;
    return (
      <a href={href} className={baseClass} {...anchorProps}>
        {content}
      </a>
    );
  }

  const buttonProps = props as CtaButtonAsButtonProps;
  return (
    <button type="button" className={baseClass} {...buttonProps}>
      {content}
    </button>
  );
}

export default CtaButton;
