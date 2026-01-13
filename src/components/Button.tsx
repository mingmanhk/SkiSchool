
import Link from 'next/link';

interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({ href, children, onClick, className }: ButtonProps) => {
  const classes = `
    bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg 
    transition-colors duration-300 ease-in-out
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

export default Button;
