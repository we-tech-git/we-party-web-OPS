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
  return {
    id: data?.id || data?._id || '',
    name: data?.name || data?.username || data?.fullName || '',
    email: data?.email || '',
    avatar: data?.profileImage || data?.avatar || data?.profilePicture || DEFAULT_AVATAR,
  }
}

export function useCurrentUser () {
  async function loadUser () {
    // Carrega do cache primeiro (login response)
    const cached = AuthService.getUser()
    if (cached) {
      const parsed = parseUserFromData(cached)
      currentUser.value = { ...currentUser.value, ...parsed } as CurrentUser
    }

    // Busca dados atualizados da API
    const id = currentUser.value.id
    if (!id) {
      return
    }

    try {
      const response = await getUserById(id)
      const user = response?.data || response
      if (user) {
        const fresh = parseUserFromData(user)
        currentUser.value = { ...currentUser.value, ...fresh } as CurrentUser
        // Atualiza cache local
        AuthService.saveAuthData({ success: true, message: '', token: AuthService.getToken() ?? '', user })
      }
    } catch (error) {
      console.warn('[useCurrentUser] Erro ao buscar usuário da API, usando cache:', error)
    }
  }

  function getFirstName () {
    return currentUser.value.name.split(' ')[0] || ''
  }

  return { currentUser, loadUser, getFirstName }
}
