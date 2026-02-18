import axios from 'axios'
import { defineStore } from 'pinia'
import { STORAGE_KEY_NAME } from '@/utils/storageKeys'

const API_BASE_URL = import.meta.env.VITE__BASE_URL || 'https://api.dev.wepartyapp.com'

interface CreateEventState {
  title: string
  description: string
  startDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endDate: string // YYYY-MM-DD
  endTime: string // HH:mm
  zip: string
  city: string
  state: string
  district: string
  street: string
  number: string
  latitude: string
  longitude: string
  isPublic: boolean
  allowComments: boolean
  showInMainFeed: boolean
  photo: File | null
  interestIds: string[]
  isLoading: boolean
  error: string | null
}

export const useCreateEventStore = defineStore('createEvent', {
  state: (): CreateEventState => ({
    title: '',
    description: '',
    startDate: '',
    startTime: '22:00',
    endDate: '',
    endTime: '06:00',
    zip: '',
    city: '',
    state: '',
    district: '',
    street: '',
    number: '',
    latitude: '',
    longitude: '',
    isPublic: true,
    allowComments: true,
    showInMainFeed: true,
    photo: null,
    interestIds: [],
    isLoading: false,
    error: null,
  }),
  getters: {
    locationString: state => {
      const parts = [
        state.street,
        state.number,
        state.district,
        state.city,
      ].filter(Boolean)

      let loc = parts.join(', ')
      if (state.state) {
        loc += ` - ${state.state}`
      }
      return loc
    },
    coordinatesPayload: state => {
      const lat = Number.parseFloat(state.latitude)
      const lng = Number.parseFloat(state.longitude)
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng }
      }
      return null
    },
    startDateISO: state => {
      if (!state.startDate) {
        return ''
      }
      const time = state.startTime || '22:00'
      return new Date(`${state.startDate}T${time}:00.000Z`).toISOString()
    },
    endDateISO: state => {
      if (!state.startDate) {
        return ''
      }
      const date = state.endDate || state.startDate
      const time = state.endTime || '06:00'
      const dt = new Date(`${date}T${time}:00.000Z`)
      // If end is before start (next day scenario), add 1 day
      const start = new Date(`${state.startDate}T${state.startTime || '22:00'}:00.000Z`)
      if (dt <= start && !state.endDate) {
        dt.setDate(dt.getDate() + 1)
      }
      return dt.toISOString()
    },
  },
  actions: {
    async submitEvent () {
      this.isLoading = true
      this.error = null

      try {
        const token = localStorage.getItem(STORAGE_KEY_NAME.ACCESS_TOKEN)
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        }

        // Se houver foto, usa endpoint com imagens (multipart/form-data)
        if (this.photo) {
          const formData = new FormData()
          formData.append('title', this.title)
          formData.append('description', this.description)
          formData.append('startDate', this.startDateISO)
          formData.append('endDate', this.endDateISO)
          formData.append('location', this.locationString)

          if (this.coordinatesPayload) {
            formData.append('coordinates', JSON.stringify(this.coordinatesPayload))
          }

          formData.append('isPublic', String(this.isPublic))
          formData.append('allowComments', String(this.allowComments))
          formData.append('showInMainFeed', String(this.showInMainFeed))
          formData.append('photos', this.photo)

          if (this.interestIds.length > 0) {
            formData.append('interestIds', JSON.stringify(this.interestIds))
          }

          await axios.post(`${API_BASE_URL}/events/with-images`, formData, {
            headers: {
              ...headers,
              'Content-Type': 'multipart/form-data',
            },
          })
        } else {
          // Sem foto, usa endpoint padrão (JSON)
          const payload = {
            title: this.title,
            description: this.description,
            startDate: this.startDateISO,
            endDate: this.endDateISO,
            location: this.locationString,
            coordinates: this.coordinatesPayload,
            isPublic: this.isPublic,
            allowComments: this.allowComments,
            showInMainFeed: this.showInMainFeed,
            interestIds: this.interestIds.length > 0 ? this.interestIds : undefined,
          }

          await axios.post(`${API_BASE_URL}/events`, payload, {
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
          })
        }

        return true
      } catch (error: any) {
        console.error('Failed to create event', error)
        this.error = error.response?.data?.message || error.message || 'Error creating event'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async updateEvent (eventId: string, data: { photos?: string[], coordinates?: { lat: number, lng: number } }) {
      this.isLoading = true
      this.error = null

      try {
        const token = localStorage.getItem(STORAGE_KEY_NAME.ACCESS_TOKEN)

        await axios.patch(`${API_BASE_URL}/events/${eventId}`, data, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        return true
      } catch (error: any) {
        console.error('Failed to update event', error)
        this.error = error.response?.data?.message || error.message || 'Error updating event'
        return false
      } finally {
        this.isLoading = false
      }
    },

    resetForm () {
      this.title = ''
      this.description = ''
      this.startDate = ''
      this.startTime = '22:00'
      this.endDate = ''
      this.endTime = '06:00'
      this.zip = ''
      this.city = ''
      this.state = ''
      this.district = ''
      this.street = ''
      this.number = ''
      this.latitude = ''
      this.longitude = ''
      this.isPublic = true
      this.allowComments = true
      this.showInMainFeed = true
      this.photo = null
      this.interestIds = []
    },
  },
})
