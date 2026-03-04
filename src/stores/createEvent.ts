import { defineStore } from 'pinia'
import { createEvent, createEventWithImages, getEventById, updateEvent as updateEventService } from '@/services/events'

export interface Faq {
  question: string
  answer: string
}

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
  invitedUserIds: string[]
  faqs: Faq[]
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
    invitedUserIds: [],
    faqs: [],
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

          if (this.invitedUserIds.length > 0) {
            formData.append('invitedUserIds', JSON.stringify(this.invitedUserIds))
          }

          if (this.faqs.length > 0) {
            formData.append('faqs', JSON.stringify(this.faqs))
          }

          await createEventWithImages(formData)
        } else {
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
            invitedUserIds: this.invitedUserIds.length > 0 ? this.invitedUserIds : undefined,
            faqs: this.faqs.length > 0 ? this.faqs : undefined,
          }

          await createEvent(payload)
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
        await updateEventService(eventId, data)

        return true
      } catch (error: any) {
        console.error('Failed to update event', error)
        this.error = error.response?.data?.message || error.message || 'Error updating event'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async submitUpdate (eventId: string) {
      this.isLoading = true
      this.error = null
      try {
        const payload: Record<string, any> = {
          title: this.title,
          description: this.description,
          startDate: this.startDateISO,
          endDate: this.endDateISO,
          location: this.locationString,
          isPublic: this.isPublic,
          allowComments: this.allowComments,
          showInMainFeed: this.showInMainFeed,
          interestIds: this.interestIds.length > 0 ? this.interestIds : undefined,
          faqs: this.faqs.length > 0 ? this.faqs : undefined,
        }
        if (this.photo) {
          const formData = new FormData()
          Object.entries(payload).forEach(([k, v]) => {
            if (v !== undefined) formData.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
          })
          formData.append('photos', this.photo)
          await updateEventService(eventId, formData as any)
        } else {
          await updateEventService(eventId, payload)
        }
        return true
      } catch (error: any) {
        console.error('Failed to update event', error)
        this.error = error.response?.data?.message || error.message || 'Erro ao atualizar evento'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async loadEventForEdit (eventId: string) {
      this.isLoading = true
      this.error = null
      try {
        const res = await getEventById(eventId) as any
        const ev: any = res?.data ?? res

        const parseDate = (iso: string) => (iso ? iso.split('T')[0] : '')
        const parseTime = (iso: string) => {
          if (!iso) return ''
          const d = new Date(iso)
          return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
        }

        this.title = ev.title ?? ev.name ?? ''
        this.description = ev.description ?? ''
        const sd = ev.startDate ?? ev.start_date ?? ''
        const ed = ev.endDate ?? ev.end_date ?? ''
        this.startDate = parseDate(sd)
        this.startTime = parseTime(sd) || '22:00'
        this.endDate = parseDate(ed)
        this.endTime = parseTime(ed) || '06:00'
        this.isPublic = ev.isPublic ?? ev.is_public ?? true
        this.allowComments = ev.allowComments ?? ev.allow_comments ?? true
        this.showInMainFeed = ev.showInMainFeed ?? ev.show_in_main_feed ?? true
        this.interestIds = ev.interestIds ?? ev.interest_ids ?? []
        this.faqs = ev.faqs ?? []
        this.photo = null

        // Best-effort: parse location string back to fields
        const loc: string = ev.location ?? ''
        // Expected format: "street, number, district, city - state"
        const dashIdx = loc.lastIndexOf(' - ')
        const stateStr = dashIdx >= 0 ? loc.slice(dashIdx + 3).trim() : ''
        const beforeState = dashIdx >= 0 ? loc.slice(0, dashIdx) : loc
        const parts = beforeState.split(',').map((s: string) => s.trim())
        this.street = parts[0] ?? ''
        this.number = parts[1] ?? ''
        this.district = parts[2] ?? ''
        this.city = parts[3] ?? ''
        this.state = stateStr
        this.zip = ''
      } catch (error: any) {
        this.error = error.response?.data?.message || error.message || 'Erro ao carregar evento'
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
      this.invitedUserIds = []
      this.faqs = []
    },
  },
})
