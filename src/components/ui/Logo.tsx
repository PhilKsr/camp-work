import { cn } from '@/lib/utils';
import { colors } from '@/lib/brand';

interface LogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark';
}

const sizeMap = {
  sm: { iconSize: 16, fontSize: 'text-lg' },
  md: { iconSize: 20, fontSize: 'text-xl' },
  lg: { iconSize: 28, fontSize: 'text-2xl' },
  xl: { iconSize: 36, fontSize: 'text-4xl' },
};

// Static components outside of render to avoid React hooks warnings
const TentIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* WiFi signal arcs on tent peak */}
    <g transform="translate(12, 4)">
      <path
        d="M-6 6 C-6 2.5, -3 0, 0 0 C3 0, 6 2.5, 6 6"
        stroke={colors.primary.sage}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-4 5 C-4 3, -2 2, 0 2 C2 2, 4 3, 4 5"
        stroke={colors.primary.sage}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M-2 4.5 C-2 3.8, -1 3.5, 0 3.5 C1 3.5, 2 3.8, 2 4.5"
        stroke={colors.primary.sage}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </g>

    {/* Tent shape */}
    <path
      d="M4 20 L12 6 L20 20 Z"
      fill={colors.primary.forest}
      stroke={colors.primary.forestLight}
      strokeWidth="1"
      strokeLinejoin="round"
    />

    {/* Tent door opening */}
    <path
      d="M10 20 L12 14 L14 20"
      fill={colors.primary.forestMuted}
      stroke="none"
    />

    {/* Tent center line for depth */}
    <line
      x1="12"
      y1="6"
      x2="12"
      y2="20"
      stroke={colors.primary.forestMuted}
      strokeWidth="1"
      opacity="0.6"
    />
  </svg>
);

const WordmarkComponent = ({
  fontSize,
  textColor,
}: {
  fontSize: string;
  textColor: string;
}) => (
  <div
    className={cn('flex items-center gap-1 font-inter', fontSize)}
    style={{ color: textColor }}
  >
    <span className="font-bold">Camp</span>
    <span className="font-normal">Work</span>
  </div>
);

export function Logo({
  variant = 'full',
  size = 'md',
  className,
  theme = 'light',
}: LogoProps) {
  const { iconSize, fontSize } = sizeMap[size];
  const textColor = theme === 'dark' ? 'white' : colors.neutral.gray900;
  const spacing = size === 'sm' ? 6 : size === 'md' ? 8 : 12;

  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <TentIcon size={iconSize} />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div className={cn('flex items-center', className)}>
        <WordmarkComponent fontSize={fontSize} textColor={textColor} />
      </div>
    );
  }

  // Full variant (default)
  return (
    <div
      className={cn('flex items-center', className)}
      style={{ gap: spacing }}
    >
      <TentIcon size={iconSize} />
      <WordmarkComponent fontSize={fontSize} textColor={textColor} />
    </div>
  );
}
