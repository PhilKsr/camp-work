'use client';

import { useState } from 'react';
import { BUILD_INFO } from '@/lib/version';
import { cn } from '@/lib/utils';

interface VersionBadgeProps {
  className?: string;
}

export function VersionBadge({ className }: VersionBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn('relative group', className)}
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <span className="text-xs text-gray-400 hover:text-gray-600 cursor-default transition-colors">
        v{BUILD_INFO.version}
      </span>

      {showDetails && (
        <div className="absolute bottom-full right-0 mb-1 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 shadow-lg">
          <div>Version: {BUILD_INFO.version}</div>
          <div>
            Build: {new Date(BUILD_INFO.buildTime).toLocaleDateString()}
          </div>
          <div>Commit: {BUILD_INFO.gitCommit.substring(0, 7)}</div>
          <div>Env: {BUILD_INFO.env}</div>
        </div>
      )}
    </div>
  );
}
