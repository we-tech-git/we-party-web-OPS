import axios from 'axios'
import { STORAGE_KEY_NAME } from '@/utils/storageKeys'

const API_BASE_URL = import.meta.env.VITE__BASE_URL || 'https://api.dev.wepartyapp.com'

function getAuthHeaders () {
  const token = localStorage.getItem(STORAGE_KEY_NAME.ACCESS_TOKEN)
  if (token) {
    console.log('[API] Token encontrado:', token.slice(0, 20) + '...')
  } else {
    console.warn('[API] Token de autenticação não encontrado no localStorage')
  }
  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function callApi<T = any> (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: any,
  auth = true,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const headers: Record<string, string> = {}

  if (auth) {
    Object.assign(headers, getAuthHeaders())
  }

  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const { data } = await axios({
      method,
      url,
      data: body,
      headers,
    })

    return data as T
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error('[API] Erro 401 - Não autorizado. Token inválido ou expirado.')
    } else if (error.response?.status === 404) {
      console.error(`[API] Erro 404 - Endpoint não encontrado: ${method} ${url}`)
    } else {
      console.error(`[API] Erro na requisição ${method} ${path}:`, error.response?.data || error.message)
    }
    throw error
  }
}
