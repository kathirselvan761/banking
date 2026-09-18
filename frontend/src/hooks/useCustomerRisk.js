import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCustomer,
  getCustomerRisk,
  getCustomerRiskHistory,
  getCustomerEvents,
} from '../services/api';

/**
 * Custom hook for live customer risk data, history, and audit timeline
 * Features 5-second polling with smooth background refetching
 */
export function useCustomerRisk(customerId) {
  const [customer, setCustomer] = useState(null);
  const [risk, setRisk] = useState(null);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Avoid race conditions or unmounted updates
  const isMounted = useRef(true);

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!customerId) return;
      try {
        if (!isBackground) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        // Fetch customer profile, risk analysis, risk history, and audit events in parallel
        const [customerRes, riskRes, historyRes, eventsRes] = await Promise.allSettled([
          getCustomer(customerId),
          getCustomerRisk(customerId),
          getCustomerRiskHistory(customerId),
          getCustomerEvents(customerId),
        ]);

        if (!isMounted.current) return;

        if (customerRes.status === 'fulfilled' && customerRes.value?.data) {
          setCustomer(customerRes.value.data);
        }

        if (riskRes.status === 'fulfilled' && riskRes.value?.data) {
          setRisk(riskRes.value.data);
        }

        if (historyRes.status === 'fulfilled' && historyRes.value?.data) {
          setHistory(historyRes.value.data);
        }

        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
          setEvents(eventsRes.value.data);
        }

        setLastUpdated(new Date());
      } catch (err) {
        if (isMounted.current) {
          setError(err.message || 'Failed to fetch customer risk data');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [customerId]
  );

  // Initial fetch and 5-second polling setup
  useEffect(() => {
    isMounted.current = true;
    fetchData(false);

    // 5-second polling for live updates
    const timer = setInterval(() => {
      fetchData(true);
    }, 5000);

    return () => {
      isMounted.current = false;
      clearInterval(timer);
    };
  }, [fetchData]);

  // Manual explicit refresh (e.g. immediately after triggering a simulation)
  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    customer,
    risk,
    history,
    events,
    loading,
    refreshing,
    error,
    lastUpdated,
    refetch,
  };
}

export default useCustomerRisk;
