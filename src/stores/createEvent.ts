import axios from 'axios'
import { defineStore } from 'pinia'
import { STORAGE_KEY_NAME } from '@/utils/storageKeys'

interface CreateEventState {
  title: string
  description: string
  date: string // YYYY-MM-DD
  zip: string
  city: string
  state: string
  district: string
  street: string
  number: string
  isPublic: boolean
  allowComments: boolean
  photo: File | null
  isLoading: boolean
  error: string | null
}

export const useCreateEventStore = defineStore('createEvent', {
  state: (): CreateEventState => ({
    title: '',
    description: '',
    date: '',
    zip: '',
    city: '',
    state: '',
    district: '',
    street: '',
    number: '',
    isPublic: true,
    allowComments: true,
    photo: null,
    isLoading: false,
    error: null,
  }),
  getters: {
    locationString: state => {
      // Construct location string: "Street, Number, District, City - State"
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
  },
  actions: {
    async submitEvent () {
      this.isLoading = true
      this.error = null

      try {
        const formData = new FormData()
        formData.append('title', this.title)
        formData.append('description', this.description)

        // Construct ISO Dates
        if (this.date) {
          // Defaulting to 22:00 start time as per example implies a night event
          const startDateTime = new Date(`${this.date}T22:00:00.000Z`)
          // Defaulting to 06:00 next day
          const endDateTime = new Date(startDateTime)
          endDateTime.setHours(startDateTime.getHours() + 8)

          formData.append('startDate', startDateTime.toISOString())
          formData.append('endDate', endDateTime.toISOString())
        } else {
          // Fallback if no date selected, though validation should prevent this
          formData.append('startDate', new Date().toISOString())
          formData.append('endDate', new Date().toISOString())
        }

        formData.append('location', this.locationString)

        // Hardcoded coordinates as per request/limitation of current UI
        // In a real app, these should come from a geocoding result of the address
        formData.append('coordinates', JSON.stringify({ lat: -22.9711, lng: -43.1822 }))

        formData.append('isPublic', String(this.isPublic))
        formData.append('allowComments', String(this.allowComments))
        formData.append('showInMainFeed', 'true') // Default true?

        if (this.photo) {
          formData.append('photos', this.photo)
        }

        const token = localStorage.getItem(STORAGE_KEY_NAME.ACCESS_TOKEN)

        await axios.post('/events/with-images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        })

        // On success, maybe reset form or redirect?
        // this.resetForm()
        return true
      } catch (error: any) {
        console.error('Failed to create event', error)
        this.error = error.response?.data?.message || error.message || 'Error creating event'
        return false
      } finally {
        this.isLoading = false
      }
    },
    resetForm () {
      this.title = ''
      this.description = ''
      this.date = ''
      this.zip = ''
      this.city = ''
      this.state = ''
      this.district = ''
      this.street = ''
      this.number = ''
      this.isPublic = true
      this.allowComments = true
      this.photo = null
    },
  },
})
