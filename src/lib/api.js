export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function parseApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return {
    message: text || `Request failed with status ${response.status}`,
  };
}