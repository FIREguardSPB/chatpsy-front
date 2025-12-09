import { httpClient } from './httpClient';

export interface UsageStatsResponse {
  total_bytes: number;
  total_megabytes: number;
  clients: Array<{
    ip: string;
    requests: number;
    bytes: number;
    megabytes: number;
    first_seen: string | null;
    last_seen: string | null;
    analyze_used: number;
    analyze_limit: number;
    feedback_bonus_used: boolean;
  }>;
}

export async function getUsageStats(): Promise<UsageStatsResponse> {
  const resp = await httpClient.get<UsageStatsResponse>('/usage_stats');
  return resp.data;
}

export async function createPayment(analysis_id: string, return_url: string): Promise<{ payment_url: string; payment_id: string; }> {
  const resp = await httpClient.post('/create_payment', { analysis_id, return_url });
  return resp.data;
}

export async function addCredits(token: string, ip: string, n: number): Promise<{
  ip: string;
  analyze_limit: number;
  analyze_used: number;
}> {
  const resp = await httpClient.post(`/admin/add_credits?token=${encodeURIComponent(token)}&ip=${encodeURIComponent(ip)}&n=${n}`);
  return resp.data;
}

export async function setLimit(token: string, ip: string, limit: number): Promise<{
  ip: string;
  analyze_limit: number;
  analyze_used: number;
}> {
  const resp = await httpClient.post(`/admin/set_limit?token=${encodeURIComponent(token)}&ip=${encodeURIComponent(ip)}&limit=${limit}`);
  return resp.data;
}

export async function deleteIp(token: string, ip: string): Promise<void> {
  await httpClient.delete(`/admin/delete_ip?token=${encodeURIComponent(token)}&ip=${encodeURIComponent(ip)}`);
}

export async function getFullAnalysis(analysis_id: string) {
  const resp = await httpClient.post('/get_full_analysis', { analysis_id });
  return resp.data;
}

export async function markPaid(analysis_id: string, payment_id = 'manual', status = 'success') {
  const resp = await httpClient.post('/payment_webhook', { analysis_id, payment_id, status });
  return resp.data;
}

export async function setDefaultLimit(token: string, limit: number): Promise<{ default_analyze_limit: number }> {
  const resp = await httpClient.post(`/admin/set_default_limit?token=${encodeURIComponent(token)}&limit=${limit}`);
  return resp.data;
}

export async function setFeedbackBonus(token: string, bonus: number): Promise<{ feedback_bonus_analyses: number }> {
  const resp = await httpClient.post(`/admin/set_feedback_bonus?token=${encodeURIComponent(token)}&bonus=${bonus}`);
  return resp.data;
}
