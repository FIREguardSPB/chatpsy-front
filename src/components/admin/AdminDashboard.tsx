import { useEffect, useMemo, useState } from 'react';
import { getUsageStats, addCredits, getFullAnalysis, markPaid, type UsageStatsResponse, setLimit as setIpLimit, createPayment, deleteIp, setDefaultLimit, setFeedbackBonus } from '../../api/admin';
import styles from './AdminDashboard.module.css';

export const AdminDashboard = () => {
  const [token, setToken] = useState('');
  const [stats, setStats] = useState<UsageStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ip, setIp] = useState('');
  const [credits, setCredits] = useState(3);
  const [limit, setLimit] = useState<number>(3);
  const [defaultLimit, setDefaultLimitState] = useState<number>(3);
  const [selectedIps, setSelectedIps] = useState<Set<string>>(new Set());
  const [defaultBonus, setDefaultBonus] = useState<number>(0);

  const canAdmin = useMemo(() => token.trim().length > 0, [token]);

  const refreshStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsageStats();
      setStats(data);
    } catch (e) {
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshStats();
  }, []);

  const handleSetLimit = async () => {
    if (!canAdmin || !ip.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await setIpLimit(token, ip.trim(), limit);
      await refreshStats();
    } catch (e) {
      setError('Failed to set limit');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIp = async () => {
    if (!canAdmin || !ip.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await deleteIp(token, ip.trim());
      await refreshStats();
    } catch (e) {
      setError('Failed to delete IP');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!canAdmin) return;
    if (!window.confirm('Удалить всю статистику? Это действие необратимо.')) return;
    setLoading(true);
    setError(null);
    try {
      // NOTE: clearAll endpoint больше не используется здесь
      // Очищать статистику можно по IP или через бэкенд напрямую.
      alert('Очищение всех записей теперь доступно только через бэкенд.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultLimit = async () => {
    if (!canAdmin) return;
    setLoading(true);
    setError(null);
    try {
      await setDefaultLimit(token, defaultLimit);
      await refreshStats();
    } catch (e) {
      setError('Failed to set default limit');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async () => {
    if (!canAdmin || !ip.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await addCredits(token, ip.trim(), credits);
      await refreshStats();
    } catch (e) {
      setError('Failed to add credits');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!canAdmin || selectedIps.size === 0) return;
    if (!window.confirm(`Удалить ${selectedIps.size} IP? Это действие необратимо.`)) return;
    setLoading(true);
    setError(null);
    try {
      for (const ipToDelete of selectedIps) {
        await deleteIp(token, ipToDelete);
      }
      setSelectedIps(new Set());
      await refreshStats();
    } catch (e) {
      setError('Failed to delete selected IPs');
    } finally {
      setLoading(false);
    }
  };

  const handleSetFeedbackBonus = async () => {
    if (!canAdmin) return;
    setLoading(true);
    setError(null);
    try {
      await setFeedbackBonus(token, defaultBonus);
      await refreshStats();
    } catch (e) {
      setError('Failed to set feedback bonus');
    } finally {
      setLoading(false);
    }
  };

  const toggleIp = (ip: string) => {
    setSelectedIps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ip)) {
        newSet.delete(ip);
      } else {
        newSet.add(ip);
      }
      return newSet;
    });
  };

  return (
    <div className={styles.adminRoot}>
      <section className={styles.card}>
        <h2>Admin</h2>
        <div className={styles.row}>
          <label>Token</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="ADMIN_TOKEN" />
        </div>
      </section>

      <section className={styles.card}>
        <h3>Usage Stats</h3>
        <button onClick={refreshStats} disabled={loading}>Refresh</button>
        <button onClick={handleClearAll} disabled={!canAdmin || loading} className={styles.danger}>Clear All</button>
        <button onClick={handleDeleteSelected} disabled={!canAdmin || selectedIps.size === 0 || loading} className={styles.danger}>
          Delete Selected ({selectedIps.size})
        </button>
        {loading && <div className={styles.info}>Loading...</div>}
        {error && <div className={styles.error}>{error}</div>}
        {stats && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={stats.clients.length > 0 && selectedIps.size === stats.clients.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIps(new Set(stats.clients.map((c) => c.ip)));
                      } else {
                        setSelectedIps(new Set());
                      }
                    }}
                  />
                </th>
                <th>IP</th>
                <th>Requests</th>
                <th>MB</th>
                <th>Used</th>
                <th>Limit</th>
                <th>Bonus</th>
                <th>First</th>
                <th>Last</th>
              </tr>
            </thead>
            <tbody>
              {stats.clients.map((c) => (
                <tr key={c.ip}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIps.has(c.ip)}
                      onChange={() => toggleIp(c.ip)}
                    />
                  </td>
                  <td>{c.ip}</td>
                  <td>{c.requests}</td>
                  <td>{c.megabytes}</td>
                  <td>{c.analyze_used}</td>
                  <td>{c.analyze_limit}</td>
                  <td>{String(c.feedback_bonus_used)}</td>
                  <td>{c.first_seen ?? '-'}</td>
                  <td>{c.last_seen ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className={styles.card}>
        <h3>Set Limit</h3>
        <div className={styles.row}>
          <label>IP</label>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="127.0.0.1" />
        </div>
        <div className={styles.row}>
          <label>Limit</label>
          <input type="number" value={limit} onChange={(e) => setLimit(Number(e.target.value) || 0)} />
        </div>
        <button onClick={handleSetLimit} disabled={!canAdmin || loading}>Apply</button>
      </section>

      <section className={styles.card}>
        <h3>Add Credits</h3>
        <div className={styles.row}>
          <label>IP</label>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="127.0.0.1" />
        </div>
        <div className={styles.row}>
          <label>Credits</label>
          <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value) || 0)} />
        </div>
        <button onClick={handleAddCredits} disabled={!canAdmin || loading}>Apply</button>
      </section>
      <section className={styles.card}>
        <h3>Delete IP</h3>
        <div className={styles.row}>
          <label>IP</label>
          <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="127.0.0.1" />
        </div>
        <button onClick={handleDeleteIp} disabled={!canAdmin || loading} className={styles.danger}>Delete</button>
      </section>

      <section className={styles.card}>
        <h3>Feedback Bonus</h3>
        <div className={styles.row}>
          <label>Bonus analyses</label>
          <input type="number" value={defaultBonus} onChange={(e) => setDefaultBonus(Number(e.target.value) || 0)} />
        </div>
        <button onClick={handleSetFeedbackBonus} disabled={!canAdmin || loading}>Apply</button>
      </section>
      <section className={styles.card}>
        <h3>Global Default Limit</h3>
        <div className={styles.row}>
          <label>Default Limit</label>
          <input type="number" value={defaultLimit} onChange={(e) => setDefaultLimitState(Number(e.target.value) || 0)} />
        </div>
        <button onClick={handleSetDefaultLimit} disabled={!canAdmin || loading}>Apply</button>
      </section>
    </div>
  );
};
