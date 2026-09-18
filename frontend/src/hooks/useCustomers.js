import { useState, useEffect, useCallback, useMemo } from 'react';
import { getCustomers } from '../services/api';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('risk_desc');

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCustomers();
      if (res && res.data) {
        setCustomers(res.data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setError(err.message || 'Unable to load customer list');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let list = [...customers];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.customer_id.toLowerCase().includes(q) ||
          (c.name && c.name.toLowerCase().includes(q))
      );
    }

    if (riskFilter !== 'ALL') {
      list = list.filter(
        (c) => (c.risk_level || 'LOW').toUpperCase() === riskFilter.toUpperCase()
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'risk_desc':
          return (b.risk_score || 0) - (a.risk_score || 0);
        case 'risk_asc':
          return (a.risk_score || 0) - (b.risk_score || 0);
        case 'credit_desc':
          return (b.credit_score || 0) - (a.credit_score || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    return list;
  }, [customers, search, riskFilter, sortBy]);

  return {
    customers: filteredCustomers,
    rawCustomers: customers,
    loading,
    error,
    refetch: fetchCustomers,
    search,
    setSearch,
    riskFilter,
    setRiskFilter,
    sortBy,
    setSortBy,
  };
}

export default useCustomers;
