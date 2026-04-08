import { ref } from 'vue'
import { AuthService } from '@/services/auth'
import { getUserById } from '@/services/users'

export interface CurrentUser {
  id: string
  name: string
  email: string
  avatar: string
}

const DEFAULT_AVATAR = 'https://cdn.vuetifyjs.com/images/john.jpg'

// Estado global compartilhado entre layouts e componentes
const currentUser = ref<CurrentUser>({
  id: '',
  name: '',
  email: '',
  avatar: DEFAULT_AVATAR,
})

function parseUserFromData (data: any): Partial<CurrentUser> {
  console.log('[parseUserFromData] Input:', data)
  
  // Suporta múltiplos formatos de resposta da API
  const result = {
    id: data?.id || data?._id || data?.userId || '',
    name: data?.name || data?.username || data?.fullName || data?.displayName || '',
    email: data?.email || data?.userEmail || '',
    avatar: data?.profileImage || data?.avatar || data?.profilePicture || data?.photo || DEFAULT_AVATAR,
  }
  
  console.log('[parseUserFromData] Output:', result)
  return result
}

export function useCurrentUser () {
  async function loadUser () {
    // Carrega do cache primeiro (login response)
    const cached = AuthService.getUser()
    const token = AuthService.getToken()
    console.log('[useCurrentUser] Token existe?', !!token)
    console.log('[useCurrentUser] Dados do cache:', cached)
    
    if (cached) {
      const parsed = parseUserFromData(cached)
      console.log('[useCurrentUser] Dados parseados:', parsed)
      currentUser.value = { ...currentUser.value, ...parsed } as CurrentUser
    }

    // Se temos token mas não temos dados do usuário, tentamos buscar o userId do token
    if (!currentUser.value.id && token) {
      try {
        // Tenta decodificar o token JWT para pegar o userId
        const parts = token.split('.')
        if (parts.length !== 3 || !parts[1]) {
          console.warn('[useCurrentUser] Token JWT inválido')
          return
        }
        const tokenPayload = JSON.parse(atob(parts[1]))
        console.log('[useCurrentUser] Payload do token:', tokenPayload)
        const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id
        
        if (userId) {
          console.log('[useCurrentUser] UserId encontrado no token:', userId)
          const response = await getUserById(userId)
          const user = response?.data || response
          console.log('[useCurrentUser] Dados do usuário da API:', user)
          
          if (user) {
            const fresh = parseUserFromData(user)
            currentUser.value = { ...currentUser.value, ...fresh } as CurrentUser
            // Salva no cache para próximas vezes
            AuthService.saveAuthData({ success: true, message: '', token, user })
            return
          }
        }
      } catch (error) {
        console.error('[useCurrentUser] Erro ao decodificar token:', error)
      }
    }

    // Se já temos os dados básicos do cache, não precisa buscar da API imediatamente
    if (!currentUser.value.id) {
      // Se não temos nem o ID, não podemos buscar da API
      console.warn('[useCurrentUser] Sem ID de usuário, não é possível buscar da API')
      return
    }

    console.log('[useCurrentUser] Buscando dados atualizados da API para userId:', currentUser.value.id)
    
    // Busca dados atualizados da API em background
    try {
      const response = await getUserById(currentUser.value.id)
      const user = response?.data || response
      console.log('[useCurrentUser] Resposta da API:', user)
      
      if (user) {
        const fresh = parseUserFromData(user)
        currentUser.value = { ...currentUser.value, ...fresh } as CurrentUser
        // Atualiza cache local
        AuthService.saveAuthData({ success: true, message: '', token: AuthService.getToken() ?? '', user })
      }
    } catch (error) {
      // Usa dados do cache em caso de erro
      if (import.meta.env.DEV) {
        console.warn('[useCurrentUser] Usando dados do cache, erro ao buscar da API:', error)
      }
    }
  }

  function getFirstName () {
    return currentUser.value.name.split(' ')[0] || ''
  }

  return { currentUser, loadUser, getFirstName }
}
