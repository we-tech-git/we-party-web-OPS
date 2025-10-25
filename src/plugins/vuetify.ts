// src/plugins/vuetify.ts

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#ff4f8b',
          secondary: '#ff8c00',
          surface: '#ffffff',
          background: '#f5f5f5',
        },
      },
    },
  },
})
