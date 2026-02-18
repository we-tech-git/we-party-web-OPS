import { callApi } from './api'

export interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  location?: string
  coordinates?: { lat: number, lng: number }
  isPublic: boolean
  allowComments: boolean
  showInMainFeed: boolean
  photos?: string[]
  interestIds?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface EventStats {
  totalEvents: number
  upcomingEvents: number
  pastEvents: number
  totalParticipants: number
}

// ─── Eventos ────────────────────────────────────────────────

// Lista todos os eventos do usuário logado
// ENDPOINT: GET /events
export function getMyEvents () {
  return callApi<{ data: Event[] }>('GET', '/events', undefined, true)
}

// Busca um evento específico por ID
// ENDPOINT: GET /events/{id}
export function getEventById (eventId: string) {
  return callApi<{ data: Event }>('GET', `/events/${eventId}`, undefined, true)
}

// Lista eventos próximos (upcoming)
// ENDPOINT: GET /events/upcoming
export function getUpcomingEvents () {
  return callApi<{ data: Event[] }>('GET', '/events/upcoming', undefined, true)
}

// Lista eventos passados
// ENDPOINT: GET /events/past
export function getPastEvents () {
  return callApi<{ data: Event[] }>('GET', '/events/past', undefined, true)
}

// Deleta um evento
// ENDPOINT: DELETE /events/{id}
export function deleteEvent (eventId: string) {
  return callApi('DELETE', `/events/${eventId}`, undefined, true)
}

// Atualiza um evento existente
// ENDPOINT: PATCH /events/{id}
export function updateEvent (eventId: string, data: Partial<Event>) {
  return callApi<{ data: Event }>('PATCH', `/events/${eventId}`, data, true)
}

// ─── Participantes ──────────────────────────────────────────

export interface Participant {
  id: string
  userId: string
  eventId: string
  name: string
  email?: string
  avatar?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  checkedIn: boolean
  checkedInAt?: string
  confirmedAt: string
}

// Lista participantes de um evento
// ENDPOINT: GET /events/{id}/participants
export function getEventParticipants (eventId: string) {
  return callApi<{ data: Participant[] }>('GET', `/events/${eventId}/participants`, undefined, true)
}

// Faz check-in de um participante
// ENDPOINT: POST /events/{eventId}/participants/{participantId}/checkin
export function checkinParticipant (eventId: string, participantId: string) {
  return callApi('POST', `/events/${eventId}/participants/${participantId}/checkin`, undefined, true)
}

// Remove um participante do evento
// ENDPOINT: DELETE /events/{eventId}/participants/{participantId}
export function removeParticipant (eventId: string, participantId: string) {
  return callApi('DELETE', `/events/${eventId}/participants/${participantId}`, undefined, true)
}

// ─── Analytics ──────────────────────────────────────────────

export interface EventAnalytics {
  views: number
  shares: number
  interested: number
  confirmed: number
  checkedIn: number
  conversionRate: number
}

// Busca analytics de um evento
// ENDPOINT: GET /events/{id}/analytics
export function getEventAnalytics (eventId: string) {
  return callApi<{ data: EventAnalytics }>('GET', `/events/${eventId}/analytics`, undefined, true)
}

// ─── Estatísticas do Dashboard ──────────────────────────────

// Busca estatísticas gerais do produtor
// ENDPOINT: GET /dashboard/stats
export function getDashboardStats () {
  return callApi<{ data: EventStats }>('GET', '/dashboard/stats', undefined, true)
}
