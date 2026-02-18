/**
 * AuthService
 * Serviço para gerenciar autenticação e dados do usuário
 */

import { STORAGE_KEY_NAME } from '@/utils/storageKeys'

interface AuthData {
  success: boolean
  message: string
  token: string
  user: any
}

interface UserData {
  [key: string]: any
  id?: string
  email?: string
  name?: string
}

export const AuthService = {
  /**
   * Salva os dados de autenticação no localStorage
   */
  saveAuthData (data: AuthData): void {
    if (data.token) {
      localStorage.setItem(STORAGE_KEY_NAME.ACCESS_TOKEN, data.token)
    }
    if (data.user) {
      localStorage.setItem('USER_DATA', JSON.stringify(data.user))
    }
  },

  /**
   * Obtém o token de acesso salvo
   */
  getToken (): string | null {
    return localStorage.getItem(STORAGE_KEY_NAME.ACCESS_TOKEN)
  },

  /**
   * Obtém os dados do usuário salvo
   */
  getUser (): UserData | null {
    const userData = localStorage.getItem('USER_DATA')
    if (userData) {
      try {
        return JSON.parse(userData)
      } catch {
        return null
      }
    }
    return null
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated (): boolean {
    return !!this.getToken()
  },

  /**
   * Limpa os dados de autenticação (logout)
   */
  logout (): void {
    localStorage.removeItem(STORAGE_KEY_NAME.ACCESS_TOKEN)
    localStorage.removeItem('USER_DATA')
  },

  /**
   * Obtém o header de autorização para requisições
   */
  getAuthHeader (): { Authorization: string } | object {
    const token = this.getToken()
    if (token) {
      return { Authorization: `Bearer ${token}` }
    }
    return {}
  },
}

export default AuthService
