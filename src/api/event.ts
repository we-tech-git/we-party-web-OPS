/**
 * API wrapper para funções de eventos
 * Re-exporta as funções de /services/events.ts para compatibilidade com o componente EventEdit
 */

import {

  uploadEventImages,
} from '@/services/events'

// Re-exporta as funções principais

/**
 * Upload do banner do evento
 * Usa uploadEventImages internamente, mas aceita apenas um arquivo
 */
export async function uploadEventBanner (eventId: string | number, file: File) {
  const formData = new FormData()
  formData.append('images', file)

  return uploadEventImages(String(eventId), formData)
}

// Re-exporta os tipos

export { createEvent, type CreateEventPayload, deleteEvent, type Event, getEventById, updateEvent } from '@/services/events'
