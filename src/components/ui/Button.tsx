import React from "react";

const variantClasses: Record<string, string> = {
  default: "bg-primary-500 text-white hover:bg-primary-600",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "underline-offset-4 hover:underline text-primary",
};

const sizeClasses: Record<string, string> = {
  default: "h-10 py-2 px-4",
  sm: "h-9 px-3 rounded-md",
  lg: "h-11 px-8 rounded-md",
};

const base =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const classes = [base, variantClasses[variant], sizeClasses[size], className]
      .filter(Boolean)
      .join(" ");
    return <button className={classes} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button };
