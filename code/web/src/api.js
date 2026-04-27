
// Central API client for NBS Census System
const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const API = {
  // ── Auth ──────────────────────────────────────────────────
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),
  verifyMfa: (email, code) =>
    request('POST', '/auth/mfa/verify', { email, code }),
  refreshToken: (refreshToken) =>
    request('POST', '/auth/refresh', { refreshToken }),
  forgotPassword: (email) =>
    request('POST', '/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    request('POST', '/auth/reset-password', { token, newPassword }),
  changePassword: (currentPassword, newPassword, token) =>
    request('POST', '/auth/change-password', { currentPassword, newPassword }, token),
  getMe: (token) =>
    request('GET', '/auth/me', null, token),

  // ── Geography (from DB) ───────────────────────────────────
  getRegions: (scope = 'national') =>
    request('GET', `/geography/regions?scope=${scope}`),
  getDistricts: (region) =>
    request('GET', `/geography/districts?region=${encodeURIComponent(region)}`),
  getWards: (district, region = '') =>
    request('GET', `/geography/wards?district=${encodeURIComponent(district)}&region=${encodeURIComponent(region)}`),
  getGeoSummary: () =>
    request('GET', '/geography/summary'),

  // ── Census / Demographics ─────────────────────────────────
  getDemographics: (scope, region, district, ward) =>
    request('GET', `/census/demographics?scope=${scope}&region=${encodeURIComponent(region||'')}&district=${encodeURIComponent(district||'')}&ward=${encodeURIComponent(ward||'')}`),
  getPopulationPyramid: (scope) =>
    request('GET', `/census/pyramid?scope=${scope}`),
  getRegionalStats: (scope) =>
    request('GET', `/census/regional-stats?scope=${scope}`),

  // ── Admin management ──────────────────────────────────────
  getAllUsers: (token) =>
    request('GET', '/users', null, token),
  suspendUser: (id, role, token) =>
    request('PATCH', `/users/${id}/suspend`, { role }, token),
  deleteUser: (id, role, token) =>
    request('DELETE', `/users/${id}`, { role }, token),

  // ── Dashboard stats ───────────────────────────────────────
  getDashboardStats: (token) =>
    request('GET', '/dashboard/stats', null, token),

  // ── NIDA lookup ───────────────────────────────────────────
  nidaLookup: (nid, token) =>
    request('GET', `/nida/${nid}`, null, token),
}
