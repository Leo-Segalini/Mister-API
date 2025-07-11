import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo = ({ className = '', width = 50, height = 50 }: LogoProps) => {
  return (
    <Image
      src="/logo.svg"
      alt="Mister API Logo"
      width={width}
      height={height}
      className={className}
      style={{ backgroundColor: '#05df72' }}
    />
  );
};

export default Logo; 