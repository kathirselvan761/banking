import { useState, useEffect, useCallback } from 'react';
import { checkBackendHealth, checkAiServiceHealth } from '../services/api';

/**
 * Hook to poll and verify Backend and AI Service availability
 */
export const useHealthCheck = () => {
  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false, data: null });
  const [aiStatus, setAiStatus] = useState({ loading: true, online: false, data: null });

  const runCheck = useCallback(async () => {
    setBackendStatus((prev) => ({ ...prev, loading: true }));
    setAiStatus((prev) => ({ ...prev, loading: true }));

    const [backendRes, aiRes] = await Promise.all([
      checkBackendHealth(),
      checkAiServiceHealth()
    ]);

    setBackendStatus({ loading: false, online: backendRes.online, data: backendRes.data, error: backendRes.error });
    setAiStatus({ loading: false, online: aiRes.online, data: aiRes.data, error: aiRes.error });
  }, []);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  return { backendStatus, aiStatus, refetch: runCheck };
};
