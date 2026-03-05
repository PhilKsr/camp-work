'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('campwork-install-dismissed');
    if (dismissed) return;

    // Check if already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('campwork-install-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        <div className="flex items-center gap-3">
          <Logo variant="icon" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Als App installieren
            </p>
            <p className="text-xs text-muted-foreground">
              Schnellerer Zugriff von deinem Startbildschirm
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Schließen</span>
          </Button>
          <Button
            onClick={handleInstall}
            size="sm"
            className="shrink-0 bg-primary-warmGold hover:bg-primary-warmGold/90"
          >
            <Download className="w-4 h-4 mr-1" />
            App
          </Button>
        </div>
      </div>
    </div>
  );
}