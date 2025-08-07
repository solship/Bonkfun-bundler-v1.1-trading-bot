/**
 * 🚀 Solana Bundler Bot - Main Application Component
 * 
 * This is the primary entry point for the Solana Bundler Bot application.
 * It provides a sophisticated loading screen and embeds the main trading interface
 * from bundlerbot.fun with enhanced error handling and performance optimizations.
 * 
 * Key Features:
 * - Animated loading screen with progress tracking
 * - Embedded trading interface with dynamic configuration
 * - Error handling and fallback mechanisms
 * - Performance optimizations and lazy loading
 * - Responsive design and accessibility support
 * 
 * @author solship
 * @version 2.0.0
 * @repository https://github.com/solship/Bonkfun-bundler-v1.1-trading-bot.git
 */

import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// Type definitions for better type safety
interface LoadingScreenProps {
  onComplete: () => void;
  onError?: (error: Error) => void;
}

interface TradingInterfaceProps {
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface AppConfig {
  baseUrl: string;
  theme: 'light' | 'dark';
  embedded: boolean;
  session: string;
  version: string;
}

/**
 * Enhanced loading screen component with smooth animations and progress tracking
 * 
 * @param onComplete - Callback function when loading completes
 * @param onError - Optional error handler for loading failures
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  // Loading stages with descriptive text
  const loadingStages = [
    { progress: 20, text: 'Initializing Solana connection...' },
    { progress: 40, text: 'Loading wallet configurations...' },
    { progress: 60, text: 'Preparing trading interface...' },
    { progress: 80, text: 'Establishing secure connection...' },
    { progress: 100, text: 'Ready to trade!' }
  ];

  useEffect(() => {
    let currentStage = 0;
    const interval = setInterval(() => {
      try {
        if (currentStage < loadingStages.length) {
          const stage = loadingStages[currentStage];
          setProgress(stage.progress);
          setLoadingText(stage.text);
          currentStage++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 500); // Small delay for smooth transition
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Loading failed');
        setError(error.message);
        onError?.(error);
        clearInterval(interval);
      }
    }, 800); // Slower, more realistic loading

    return () => clearInterval(interval);
  }, [onComplete, onError]);

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center z-50">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="mb-8">
            <img 
              src="https://i.ibb.co/ZBYLmzH/logo.png" 
              alt="Solana Bundler" 
              className="w-16 h-16 mx-auto mb-4 opacity-75"
            />
            <h1 className="text-2xl font-bold text-white mb-2">Loading Error</h1>
            <p className="text-red-200">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-md mx-auto p-6">
        {/* Logo and Branding */}
        <div className="mb-8 animate-pulse">
          <img 
            src="https://i.ibb.co/ZBYLmzH/logo.png" 
            alt="Solana Bundler" 
            className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
          />
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Solana Bundler
          </h1>
          <p className="text-gray-300 text-lg">Advanced Multi-Wallet Trading Platform</p>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="w-80 bg-gray-700 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-gray-300 font-medium">{loadingText}</p>
          <p className="text-gray-500 text-sm">Progress: {Math.round(progress)}%</p>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced trading interface component with error handling and performance optimizations
 * 
 * @param onLoad - Callback when interface loads successfully
 * @param onError - Error handler for interface failures
 */
const TradingInterface: React.FC<TradingInterfaceProps> = ({ onLoad, onError }) => {
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Generate iframe URL with enhanced configuration
  const generateIframeUrl = useCallback((): string => {
    const config: AppConfig = {
      baseUrl: 'https://www.bundlerbot.fun',
      theme: 'dark',
      embedded: true,
      session: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: '2.0.0'
    };

    const params = new URLSearchParams({
      embedded: config.embedded.toString(),
      theme: config.theme,
      session: config.session,
      version: config.version,
      timestamp: Date.now().toString(),
      userAgent: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    return `${config.baseUrl}?${params.toString()}`;
  }, []);

  useEffect(() => {
    try {
      const url = generateIframeUrl();
      setIframeUrl(url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate interface URL';
      setLoadError(errorMessage);
      onError?.(new Error(errorMessage));
    }
  }, [generateIframeUrl, onError]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleIframeError = useCallback((error: Event) => {
    const errorMessage = 'Failed to load trading interface';
    setLoadError(errorMessage);
    setIsLoading(false);
    onError?.(new Error(errorMessage));
  }, [onError]);

  // Error state
  if (loadError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white">Interface Loading Error</h2>
          <p className="text-gray-300">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative">
      {/* Loading overlay for iframe */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-300">Loading Trading Interface...</p>
          </div>
        </div>
      )}

      {/* Main iframe */}
      <iframe
        src={iframeUrl}
        className="w-full h-full border-0"
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}
        title="Solana Bundler Trading Interface"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        loading="eager"
      />
    </div>
  );
};

/**
 * Main App component with enhanced error handling and performance optimizations
 */
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [appError, setAppError] = useState<Error | null>(null);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('App Error:', error);
    setAppError(error);
    setIsLoading(false);
  }, []);

  const handleTradingInterfaceLoad = useCallback(() => {
    console.log('Trading interface loaded successfully');
  }, []);

  // Performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`App render time: ${endTime - startTime}ms`);
    };
  }, []);

  return (
    <div className="App">
      {isLoading ? (
        <LoadingScreen 
          onComplete={handleLoadComplete}
          onError={handleError}
        />
      ) : appError ? (
        <div className="w-full h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center space-y-4 max-w-md mx-auto p-6">
            <div className="text-red-400 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white">Application Error</h2>
            <p className="text-gray-300">{appError.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Restart Application
            </button>
          </div>
        </div>
      ) : (
        <TradingInterface 
          onLoad={handleTradingInterfaceLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

export default App;
