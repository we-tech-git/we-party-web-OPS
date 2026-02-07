import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface TourStep {
  target: string
  title: string
  description: string
  icon?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const tourInstance = ref<{
  startTour: () => void
  resetTour: () => void
  isActive: { value: boolean }
} | null>(null)

export function useTour () {
  const { t } = useI18n()

  const adminTourSteps = computed<TourStep[]>(() => [
    {
      target: '[data-tour="nav-home"]',
      title: t('tour.steps.home.title'),
      description: t('tour.steps.home.description'),
      icon: 'mdi-home',
      position: 'right',
    },
    {
      target: '[data-tour="nav-new-event"]',
      title: t('tour.steps.newEvent.title'),
      description: t('tour.steps.newEvent.description'),
      icon: 'mdi-calendar-plus',
      position: 'right',
    },
    {
      target: '[data-tour="nav-lineup"]',
      title: t('tour.steps.lineup.title'),
      description: t('tour.steps.lineup.description'),
      icon: 'mdi-playlist-music',
      position: 'right',
    },
    {
      target: '[data-tour="nav-participants"]',
      title: t('tour.steps.participants.title'),
      description: t('tour.steps.participants.description'),
      icon: 'mdi-account-group',
      position: 'right',
    },
    {
      target: '[data-tour="nav-engagement"]',
      title: t('tour.steps.engagement.title'),
      description: t('tour.steps.engagement.description'),
      icon: 'mdi-fire',
      position: 'right',
    },
    {
      target: '[data-tour="nav-notifications"]',
      title: t('tour.steps.notifications.title'),
      description: t('tour.steps.notifications.description'),
      icon: 'mdi-bell',
      position: 'right',
    },
    {
      target: '[data-tour="nav-control-panel"]',
      title: t('tour.steps.controlPanel.title'),
      description: t('tour.steps.controlPanel.description'),
      icon: 'mdi-view-dashboard',
      position: 'right',
    },
    {
      target: '[data-tour="nav-analytics"]',
      title: t('tour.steps.analytics.title'),
      description: t('tour.steps.analytics.description'),
      icon: 'mdi-chart-line',
      position: 'right',
    },
    {
      target: '[data-tour="nav-post-event"]',
      title: t('tour.steps.postEvent.title'),
      description: t('tour.steps.postEvent.description'),
      icon: 'mdi-flag-checkered',
      position: 'right',
    },
    {
      target: '[data-tour="language-switcher"]',
      title: t('tour.steps.language.title'),
      description: t('tour.steps.language.description'),
      icon: 'mdi-translate',
      position: 'left',
    },
  ])

  function setTourInstance (instance: typeof tourInstance.value) {
    tourInstance.value = instance
  }

  function startTour () {
    tourInstance.value?.startTour()
  }

  function resetTour () {
    tourInstance.value?.resetTour()
  }

  const isTourActive = computed(() => tourInstance.value?.isActive.value ?? false)

  return {
    adminTourSteps,
    setTourInstance,
    startTour,
    resetTour,
    isTourActive,
  }
}
