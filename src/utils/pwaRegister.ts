// PWA Service Worker Registration & Deferred Install Prompt Handler

export interface PWAInstallState {
  isInstalled: boolean;
  canInstall: boolean;
  installApp: () => Promise<void>;
}

let deferredPrompt: any = null;
let pwaStateListeners: Array<() => void> = [];

export function registerServiceWorker() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] ServiceWorker registered successfully with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] ServiceWorker registration failed:', err);
        });
    });
  } else if ('serviceWorker' in navigator) {
    // In dev mode, register sw.js as well
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA Dev] ServiceWorker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA Dev] ServiceWorker registration notice:', err);
      });
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e;
    notifyListeners();
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
  });
}

function notifyListeners() {
  pwaStateListeners.forEach((fn) => fn());
}

export function subscribePWAState(listener: () => void) {
  pwaStateListeners.push(listener);
  return () => {
    pwaStateListeners = pwaStateListeners.filter((l) => l !== listener);
  };
}

export function isPWAInstallable(): boolean {
  return deferredPrompt !== null;
}

export async function triggerPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notifyListeners();
  return outcome === 'accepted';
}
