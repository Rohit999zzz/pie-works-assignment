const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

export const fetchJobs = async () => {
  const response = await fetch(`${API_URL}/jobs`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch jobs');
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const signup = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) throw new Error('Signup failed');
  return response.json();
};

export const fetchNudges = async (memberId) => {
  const response = await fetch(`${API_URL}/members/${memberId}/nudges`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch nudges');
  return response.json();
};

export const updateNudgeStatus = async (nudgeId, status) => {
  const response = await fetch(`${API_URL}/nudges/${nudgeId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update nudge');
  return response.json();
};

export const fetchProfile = async (memberId) => {
  const response = await fetch(`${API_URL}/members/${memberId}`, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

export const updateProfile = async (memberId, data) => {
  const response = await fetch(`${API_URL}/members/${memberId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};
