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

export interface Faq {
  question: string
  answer: string
}

export interface CreateEventPayload {
  title: string
  description: string
  startDate: string
  endDate: string
  location?: string
  coordinates?: { lat: number, lng: number } | null
  isPublic: boolean
  allowComments: boolean
  showInMainFeed: boolean
  interestIds?: string[]
  invitedUserIds?: string[]
  faqs?: Faq[]
}

// ─── Eventos ────────────────────────────────────────────────

// Lista todos os eventos (feed geral)
// ENDPOINT: GET /events
export function getEvents () {
  return callApi<{ data: Event[] }>('GET', '/events', undefined, true)
}

// Lista eventos do usuário logado
// ENDPOINT: GET /events/my-events
export function getMyEvents () {
  return callApi<{ data: Event[] }>('GET', '/events/my-events', undefined, true)
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

// Busca eventos por nome
// ENDPOINT: GET /events/search/name?name=
export function searchEventsByName (name: string) {
  return callApi<{ data: Event[] }>('GET', `/events/search/name?name=${encodeURIComponent(name)}`, undefined, true)
}

// Eventos em destaque (top)
// ENDPOINT: GET /event/top
export function getTopEvents () {
  return callApi<{ data: Event[] }>('GET', '/event/top', undefined, true)
}

// Recomendações de eventos para o usuário
// ENDPOINT: GET /events/recommendations
export function getEventRecommendations () {
  return callApi<{ data: Event[] }>('GET', '/events/recommendations', undefined, true)
}

// Eventos baseados nos interesses do usuário
// ENDPOINT: GET /events/by-interests
export function getEventsByInterests () {
  return callApi<{ data: Event[] }>('GET', '/events/by-interests', undefined, true)
}

// Eventos em tendência
// ENDPOINT: GET /events/trending
export function getTrendingEvents () {
  return callApi<{ data: Event[] }>('GET', '/events/trending', undefined, true)
}

// Eventos por intervalo de data
// ENDPOINT: GET /events/by-date-range?startDate=&endDate=
export function getEventsByDateRange (startDate: string, endDate: string) {
  return callApi<{ data: Event[] }>('GET', `/events/by-date-range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, undefined, true)
}

// Deleta um evento
// ENDPOINT: DELETE /events/{id}
export function deleteEvent (eventId: string) {
  return callApi('DELETE', `/events/${eventId}`, undefined, true)
}

// Cria um novo evento (JSON)
// ENDPOINT: POST /events
export function createEvent (payload: CreateEventPayload) {
  return callApi<{ data: Event }>('POST', '/events', payload, true)
}

// Cria evento com imagens (multipart)
// ENDPOINT: POST /events/with-images
export function createEventWithImages (formData: FormData) {
  return callApi<{ data: Event }>('POST', '/events/with-images', formData, true)
}

// Faz upload/atualização das imagens do evento
// ENDPOINT: PATCH /events/{id}/with-images
export function uploadEventImages (eventId: string, formData: FormData) {
  return callApi<{ data: Event }>('PATCH', `/events/${eventId}/with-images`, formData, true)
}

// Atualiza um evento existente (substituição completa)
// ENDPOINT: PUT /events/{id}
export function updateEvent (eventId: string, data: Partial<Event>) {
  return callApi<{ data: Event }>('PUT', `/events/${eventId}`, data, true)
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

// ─── Comentários ────────────────────────────────────────────

export interface EventComment {
  id: string
  eventId: string
  userId: string
  userName?: string
  userAvatar?: string | null
  content: string
  createdAt: string
  updatedAt?: string
}

// Lista comentários de um evento
// ENDPOINT: GET /events/{eventId}/comments
export function getEventComments (eventId: string) {
  return callApi<EventComment[]>('GET', `/events/${eventId}/comments`, undefined, true)
}

// Deleta um comentário
// ENDPOINT: DELETE /events/{eventId}/comments/{commentId}
export function deleteEventComment (eventId: string, commentId: string) {
  return callApi('DELETE', `/events/${eventId}/comments/${commentId}`, undefined, true)
}

// Atualiza um comentário
// ENDPOINT: PUT /events/{eventId}/comments/{commentId}
export function updateEventComment (eventId: string, commentId: string, content: string) {
  return callApi<EventComment>('PUT', `/events/${eventId}/comments/${commentId}`, { content }, true)
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
