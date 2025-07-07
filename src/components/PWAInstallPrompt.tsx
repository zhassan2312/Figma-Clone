"use client";

import { useState } from "react";
import usePWA from "../hooks/usePWA";

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, updateAvailable, installApp, updateApp } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(true);

  if (isInstalled || !isInstallable || !showInstallPrompt) {
    return null;
  }

  return (
    <>
      {/* Install Prompt */}
      {isInstallable && showInstallPrompt && (
        <div className="pwa-install-prompt">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span>Install Figma as an app</span>
          <button onClick={installApp}>Install</button>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="ml-2 text-blue-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Update Available Prompt */}
      {updateAvailable && showUpdatePrompt && (
        <div className="sw-update-available">
          <span>App update available</span>
          <button
            onClick={updateApp}
            className="ml-2 bg-green-800 hover:bg-green-900 px-2 py-1 rounded text-xs"
          >
            Update
          </button>
          <button
            onClick={() => setShowUpdatePrompt(false)}
            className="ml-2 text-green-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
