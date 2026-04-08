import { callApi } from './api'

export interface Interest {
  id: string
  name: string
}

export interface PendingInterest {
  id: string
  name: string
  requestedBy: string
  createdAt: string
}

// ─── Interesses (Admin / globais) ───────────────────────────

// Lista todos os interesses
// ENDPOINT: GET /interest
export function getInterests () {
  return callApi<Interest[]>('GET', '/interest', undefined, true)
}

// Busca interesses por nome
// ENDPOINT: GET /interest/search-by-name
export function searchInterestsByName (query: string) {
  return callApi<Interest[]>('GET', `/interest/search-by-name?q=${encodeURIComponent(query)}`, undefined, true)
}

// Cria um novo interesse no sistema
// ENDPOINT: POST /interest
export function createInterest (name: string) {
  return callApi<Interest>('POST', '/interest', { name }, true)
}

// Atualiza um interesse existente
// ENDPOINT: PUT /interest/{id}
export function updateInterest (id: string, name: string) {
  return callApi<Interest>('PUT', `/interest/${id}`, { name }, true)
}

// Remove um interesse do sistema (admin)
// ENDPOINT: DELETE /interest/{id}
export function deleteInterest (id: string) {
  return callApi('DELETE', `/interest/${id}`, undefined, true)
}

// Busca interesses pendentes na fila de aprovação (solicitados por usuários)
// ENDPOINT: GET /interest/public-search?limit=10&offset=0
export function getPendingInterests (limit = 10, offset = 0) {
  return callApi<PendingInterest[]>('GET', `/interest/public-search?limit=${limit}&offset=${offset}`, undefined, true)
}

// Aprova um interesse da fila
// ENDPOINT: POST /interest/{id}/approve
export function approveInterestRequest (id: string) {
  return callApi('POST', `/interest/${id}/approve`, undefined, true)
}

// Rejeita um interesse da fila
// ENDPOINT: POST /interest/{id}/reject
export function rejectInterestRequest (id: string) {
  return callApi('POST', `/interest/${id}/reject`, undefined, true)
}

// ─── Interesses do Usuário ──────────────────────────────────

// Adiciona um interesse ao usuário
// ENDPOINT: POST /users/interest
export function addUserInterest (interestId: string) {
  return callApi('POST', '/users/interest', { interestId }, true)
}

// Remove um interesse do usuário
// ENDPOINT: DELETE /users/interest/{id}
export function removeUserInterest (interestId: string) {
  return callApi('DELETE', `/users/interest/${interestId}`, undefined, true)
}

// Salva/Substitui a lista de interesses do usuário
// ENDPOINT: PUT /users/interest
export function saveUserInterests (interestIds: string[]) {
  return callApi('PUT', '/users/interest', { interestIds }, true)
}
