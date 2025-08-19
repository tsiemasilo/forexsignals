import { useState, useEffect, useCallback } from 'react';

interface ConsoleLog {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  category: 'api' | 'auth' | 'subscription' | 'payment' | 'ui' | 'network' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggested_fix?: string;
  auto_fixable?: boolean;
}

interface DebugStats {
  total_errors: number;
  api_errors: number;
  auth_errors: number;
  critical_errors: number;
  last_error_time?: Date;
  common_issues: string[];
}

export const useConsoleDebugger = () => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [stats, setStats] = useState<DebugStats>({
    total_errors: 0,
    api_errors: 0,
    auth_errors: 0,
    critical_errors: 0,
    common_issues: []
  });
  const [isActive, setIsActive] = useState(true);
  const [autoFix, setAutoFix] = useState(false);

  // Categorize and analyze log messages
  const categorizeLog = useCallback((message: string, level: string): {
    category: ConsoleLog['category'];
    severity: ConsoleLog['severity'];
    suggested_fix?: string;
    auto_fixable?: boolean;
  } => {
    const msg = message.toLowerCase();
    
    // API-related errors
    if (msg.includes('api') || msg.includes('fetch') || msg.includes('xhr') || msg.includes('404') || msg.includes('500')) {
      if (msg.includes('authentication required')) {
        return {
          category: 'auth',
          severity: 'high',
          suggested_fix: 'User session expired. Auto-redirect to login page.',
          auto_fixable: true
        };
      }
      if (msg.includes('404')) {
        return {
          category: 'api',
          severity: 'medium',
          suggested_fix: 'API endpoint not found. Check route configuration.',
          auto_fixable: false
        };
      }
      if (msg.includes('500')) {
        return {
          category: 'api',
          severity: 'high',
          suggested_fix: 'Server error. Retry request with exponential backoff.',
          auto_fixable: true
        };
      }
      return { category: 'api', severity: 'medium' };
    }

    // Authentication errors
    if (msg.includes('auth') || msg.includes('login') || msg.includes('session') || msg.includes('unauthorized')) {
      return {
        category: 'auth',
        severity: 'high',
        suggested_fix: 'Clear session data and redirect to login.',
        auto_fixable: true
      };
    }

    // Subscription errors
    if (msg.includes('subscription') || msg.includes('plan') || msg.includes('expired')) {
      return {
        category: 'subscription',
        severity: 'medium',
        suggested_fix: 'Refresh subscription status from server.',
        auto_fixable: true
      };
    }

    // Payment errors
    if (msg.includes('payment') || msg.includes('yoco') || msg.includes('ozow') || msg.includes('checkout')) {
      return {
        category: 'payment',
        severity: 'high',
        suggested_fix: 'Payment gateway issue. Show user-friendly error message.',
        auto_fixable: false
      };
    }

    // Network errors
    if (msg.includes('network') || msg.includes('cors') || msg.includes('timeout') || msg.includes('connection')) {
      return {
        category: 'network',
        severity: 'medium',
        suggested_fix: 'Network connectivity issue. Implement retry mechanism.',
        auto_fixable: true
      };
    }

    // UI/React errors
    if (msg.includes('react') || msg.includes('component') || msg.includes('render') || msg.includes('hook')) {
      return {
        category: 'ui',
        severity: level === 'error' ? 'high' : 'low',
        suggested_fix: 'React component issue. Check component state and props.',
        auto_fixable: false
      };
    }

    return { 
      category: 'general', 
      severity: level === 'error' ? 'medium' : 'low' 
    };
  }, []);

  // Auto-fix common issues
  const autoFixIssue = useCallback(async (log: ConsoleLog) => {
    if (!log.auto_fixable || !autoFix) return false;

    try {
      switch (log.category) {
        case 'auth':
          // Clear session and redirect to login
          localStorage.removeItem('user');
          sessionStorage.clear();
          window.location.href = '/login';
          return true;

        case 'api':
          if (log.message.includes('500')) {
            // Retry API request after delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            window.location.reload();
            return true;
          }
          break;

        case 'subscription':
          // Force refresh subscription status
          try {
            const response = await fetch('/api/user/subscription-status');
            if (response.ok) {
              window.location.reload();
              return true;
            }
          } catch (e) {
            console.log('Failed to refresh subscription status');
          }
          break;

        case 'network':
          // Implement retry mechanism
          await new Promise(resolve => setTimeout(resolve, 3000));
          window.location.reload();
          return true;
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
    }

    return false;
  }, [autoFix]);

  // Initialize console monitoring
  useEffect(() => {
    if (!isActive) return;

    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };

    const interceptConsole = (level: ConsoleLog['level']) => {
      return (...args: any[]) => {
        // Call original console method
        originalConsole[level](...args);

        // Process for debugging
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');

        const analysis = categorizeLog(message, level);
        
        const logEntry: ConsoleLog = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          level,
          message,
          ...analysis
        };

        // Add to logs
        setLogs(prev => {
          const newLogs = [logEntry, ...prev].slice(0, 100); // Keep last 100 logs
          return newLogs;
        });

        // Update stats
        setStats(prev => {
          const newStats = { ...prev };
          
          if (level === 'error' || level === 'warn') {
            newStats.total_errors++;
            newStats.last_error_time = new Date();
            
            if (analysis.category === 'api') newStats.api_errors++;
            if (analysis.category === 'auth') newStats.auth_errors++;
            if (analysis.severity === 'critical') newStats.critical_errors++;
            
            // Track common issues
            if (!newStats.common_issues.includes(message.substring(0, 50))) {
              newStats.common_issues = [...newStats.common_issues, message.substring(0, 50)].slice(0, 5);
            }
          }
          
          return newStats;
        });

        // Auto-fix if enabled
        if (autoFix && logEntry.auto_fixable) {
          setTimeout(() => autoFixIssue(logEntry), 1000);
        }
      };
    };

    // Override console methods
    console.log = interceptConsole('log');
    console.warn = interceptConsole('warn');
    console.error = interceptConsole('error');
    console.info = interceptConsole('info');
    console.debug = interceptConsole('debug');

    // Listen for unhandled errors
    const handleError = (event: ErrorEvent) => {
      const logEntry: ConsoleLog = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        level: 'error',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
        category: 'general',
        severity: 'high',
        suggested_fix: 'Unhandled JavaScript error. Check stack trace for details.'
      };

      setLogs(prev => [logEntry, ...prev].slice(0, 100));
      
      setStats(prev => ({
        ...prev,
        total_errors: prev.total_errors + 1,
        critical_errors: prev.critical_errors + 1,
        last_error_time: new Date()
      }));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const logEntry: ConsoleLog = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        category: 'general',
        severity: 'high',
        suggested_fix: 'Unhandled promise rejection. Add proper error handling.'
      };

      setLogs(prev => [logEntry, ...prev].slice(0, 100));
      
      setStats(prev => ({
        ...prev,
        total_errors: prev.total_errors + 1,
        critical_errors: prev.critical_errors + 1,
        last_error_time: new Date()
      }));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
      
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isActive, autoFix, categorizeLog, autoFixIssue]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setStats({
      total_errors: 0,
      api_errors: 0,
      auth_errors: 0,
      critical_errors: 0,
      common_issues: []
    });
  }, []);

  const exportLogs = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      stats,
      logs: logs.map(log => ({
        ...log,
        timestamp: log.timestamp.toISOString()
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [logs, stats]);

  return {
    logs,
    stats,
    isActive,
    autoFix,
    setIsActive,
    setAutoFix,
    clearLogs,
    exportLogs,
    autoFixIssue
  };
};