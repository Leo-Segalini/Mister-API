import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo = ({ className = '', width = 50, height = 50 }: LogoProps) => {
  return (
    <Image
      src="/logo.png"
      alt="Mister API Logo"
      width={width}
      height={height}
      className={className}
      style={{ backgroundColor: 'transparent' }}
    />
  );
};

export default Logo; 