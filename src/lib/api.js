import { supabase } from "./supabase";

const BASE = import.meta.env.VITE_API_URL;

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}
export async function apiFetch(path, options = {}) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function apiUpload(path, formData) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers = session
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}
