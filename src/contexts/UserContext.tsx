'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react'
import { AuthProvider } from './AuthContext'
import { API_URL } from '@/api/base'

interface UserContextType {
  username: string | null
  setUsername: (username: string | null) => void
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  refreshToken: string | null
  setRefreshToken: (token: string | null) => void
  authenticatedFetch: (input: string | Request | URL, init?: RequestInit, isJSON?: boolean) => Promise<Response>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export default function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"))
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("accessToken"))
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem("refreshToken"))

  const fetchUsername = async () => {
    const response = await authenticatedFetch('/user/me/', { method: "GET" })
    const data = await response.json()
    if (data.username === username) {
      return;
    }

    if (data.username) {
      setUsername(data.username)
    } else {
      setUsername(null)
    }
  }

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'accessToken' && event.newValue !== accessToken) {
        setAccessToken(event.newValue);
      }
      if (event.key === 'refreshToken' && event.newValue !== refreshToken) {
        setRefreshToken(event.newValue);
      }
      if (event.key === 'username' && event.newValue !== username) {
        setUsername(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])

  useEffect(() => {
    if (username === localStorage.getItem('username')) {
      return;
    }
    if (username) {
      localStorage.setItem('username', username)
    } else {
      localStorage.removeItem('username')
    }
  }, [username])

  useEffect(() => {
    if (accessToken === localStorage.getItem('accessToken')) {
      return;
    }
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
      fetchUsername();
    } else {
      localStorage.removeItem('accessToken')
    }
  }, [accessToken])

  useEffect(() => {
    if (refreshToken === localStorage.getItem('refreshToken')) {
      return;
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }, [refreshToken])

  const authenticatedFetch = async (input: string | Request | URL, init?: RequestInit, isJSON: boolean = true): Promise<Response> => {
    if (isJSON && init && init.body instanceof FormData) {
      init.body = JSON.stringify(Object.fromEntries(init.body.entries()));
      init.headers = {
        ...init.headers,
        'Content-Type': 'application/json',
      }
    }
    if (typeof input === 'string') {
      input = `${API_URL}${input}`;
    }
    let request = new Request(input, init)
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)
    let response = await fetch(request)
    if (response.status === 401) {
      const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.access_token);
        request = new Request(input, init)
        request.headers.set('Authorization', `Bearer ${data.access_token}`)
      }
      response = await fetch(request);
    }
    if (response.status === 401) {
      setUsername(null)
      setAccessToken(null)
      setRefreshToken(null)
    }
    return response
  }

  const value = useMemo(() => ({
    username,
    setUsername,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    authenticatedFetch
  }), [username, accessToken, refreshToken])

  return (
    <UserContext.Provider value={value}>
      {username === null ? <AuthProvider>{children}</AuthProvider> : children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}