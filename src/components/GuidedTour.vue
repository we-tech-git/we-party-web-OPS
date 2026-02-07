<template>
  <Teleport to="body">
    <Transition name="tour-fade">
      <div v-if="isActive" class="guided-tour">
        <!-- Overlay with spotlight -->
        <div class="tour-overlay">
          <svg class="tour-svg" height="100%" width="100%">
            <defs>
              <mask id="tour-mask">
                <rect
                  fill="white"
                  height="100%"
                  width="100%"
                  x="0"
                  y="0"
                />
                <rect
                  fill="black"
                  :height="spotlightRect.height + 16"
                  :rx="12"
                  :ry="12"
                  :width="spotlightRect.width + 16"
                  :x="spotlightRect.x - 8"
                  :y="spotlightRect.y - 8"
                />
              </mask>
            </defs>
            <rect fill="rgba(0, 0, 0, 0.7)" height="100%" mask="url(#tour-mask)" width="100%" />
          </svg>
        </div>

        <!-- Spotlight ring -->
        <div
          class="tour-spotlight-ring"
          :style="{
            top: `${spotlightRect.y - 12}px`,
            left: `${spotlightRect.x - 12}px`,
            width: `${spotlightRect.width + 24}px`,
            height: `${spotlightRect.height + 24}px`,
          }"
        />

        <!-- Tooltip -->
        <div
          ref="tooltipRef"
          class="tour-tooltip"
          :class="`tour-tooltip--${currentStep?.position ?? 'bottom'}`"
          :style="tooltipStyle"
        >
          <!-- Progress indicator -->
          <div class="tour-progress">
            <div
              v-for="(_, idx) in steps"
              :key="idx"
              class="tour-progress-dot"
              :class="{ 'tour-progress-dot--active': idx === currentStepIndex, 'tour-progress-dot--completed': idx < currentStepIndex }"
            />
          </div>

          <!-- Content -->
          <div class="tour-content">
            <div class="tour-icon">
              <span class="mdi" :class="currentStep?.icon ?? 'mdi-information'" />
            </div>
            <div class="tour-text">
              <h4 class="tour-title">{{ currentStep?.title }}</h4>
              <p class="tour-description">{{ currentStep?.description }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="tour-actions">
            <button
              v-if="currentStepIndex > 0"
              class="tour-btn tour-btn--secondary"
              type="button"
              @click="prevStep"
            >
              <span class="mdi mdi-arrow-left" />
              {{ t('tour.previous') }}
            </button>
            <button class="tour-btn tour-btn--skip" type="button" @click="skipTour">
              {{ t('tour.skip') }}
            </button>
            <button
              v-if="currentStepIndex < steps.length - 1"
              class="tour-btn tour-btn--primary"
              type="button"
              @click="nextStep"
            >
              {{ t('tour.next') }}
              <span class="mdi mdi-arrow-right" />
            </button>
            <button v-else class="tour-btn tour-btn--primary" type="button" @click="finishTour">
              {{ t('tour.finish') }}
              <span class="mdi mdi-check" />
            </button>
          </div>

          <!-- Step counter -->
          <div class="tour-counter">
            {{ currentStepIndex + 1 }} / {{ steps.length }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'

  interface TourStep {
    target: string
    title: string
    description: string
    icon?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
  }

  interface Props {
    steps: TourStep[]
    autoStart?: boolean
    storageKey?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    autoStart: false,
    storageKey: 'tour-completed',
  })

  const emit = defineEmits<{
    (e: 'complete' | 'skip'): void
    (e: 'step-change', stepIndex: number): void
  }>()

  const { t } = useI18n()

  const isActive = ref(false)
  const currentStepIndex = ref(0)
  const tooltipRef = ref<HTMLElement | null>(null)

  const spotlightRect = ref({ x: 0, y: 0, width: 0, height: 0 })

  const currentStep = computed(() => props.steps[currentStepIndex.value])

  const tooltipStyle = computed(() => {
    const position = currentStep.value?.position ?? 'bottom'
    const rect = spotlightRect.value
    const padding = 20

    let top = 0
    let left = 0

    switch (position) {
      case 'top': {
        top = rect.y - 180 - padding
        left = rect.x + rect.width / 2 - 180
        break
      }
      case 'bottom': {
        top = rect.y + rect.height + padding
        left = rect.x + rect.width / 2 - 180
        break
      }
      case 'left': {
        top = rect.y + rect.height / 2 - 90
        left = rect.x - 360 - padding
        break
      }
      case 'right': {
        top = rect.y + rect.height / 2 - 90
        left = rect.x + rect.width + padding
        break
      }
    }

    // Keep tooltip in viewport
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const tooltipWidth = 360
    const tooltipHeight = 180

    if (left < 20) left = 20
    if (left + tooltipWidth > viewportWidth - 20) left = viewportWidth - tooltipWidth - 20
    if (top < 20) top = 20
    if (top + tooltipHeight > viewportHeight - 20) top = viewportHeight - tooltipHeight - 20

    return {
      top: `${top}px`,
      left: `${left}px`,
    }
  })

  function updateSpotlight () {
    const target = currentStep.value?.target
    if (!target) return

    const element = document.querySelector(target)
    if (!element) {
      spotlightRect.value = { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50, width: 200, height: 100 }
      return
    }

    const rect = element.getBoundingClientRect()
    spotlightRect.value = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    }

    // Scroll element into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function nextStep () {
    if (currentStepIndex.value < props.steps.length - 1) {
      currentStepIndex.value++
      emit('step-change', currentStepIndex.value)
      nextTick(updateSpotlight)
    }
  }

  function prevStep () {
    if (currentStepIndex.value > 0) {
      currentStepIndex.value--
      emit('step-change', currentStepIndex.value)
      nextTick(updateSpotlight)
    }
  }

  function skipTour () {
    isActive.value = false
    localStorage.setItem(props.storageKey, 'skipped')
    emit('skip')
  }

  function finishTour () {
    isActive.value = false
    localStorage.setItem(props.storageKey, 'completed')
    emit('complete')
  }

  function startTour () {
    currentStepIndex.value = 0
    isActive.value = true
    nextTick(updateSpotlight)
  }

  function resetTour () {
    localStorage.removeItem(props.storageKey)
  }

  // Handle window resize
  function handleResize () {
    if (isActive.value) {
      updateSpotlight()
    }
  }

  // Handle keyboard navigation
  function handleKeydown (e: KeyboardEvent) {
    if (!isActive.value) return

    switch (e.key) {
      case 'ArrowRight':
      case 'Enter': {
        if (currentStepIndex.value < props.steps.length - 1) {
          nextStep()
        } else {
          finishTour()
        }
        break
      }
      case 'ArrowLeft': {
        prevStep()
        break
      }
      case 'Escape': {
        skipTour()
        break
      }
    }
  }

  watch(currentStepIndex, () => {
    updateSpotlight()
  })

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeydown)

    if (props.autoStart) {
      const status = localStorage.getItem(props.storageKey)
      if (!status) {
        setTimeout(startTour, 500)
      }
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeydown)
  })

  defineExpose({
    startTour,
    resetTour,
    isActive,
  })
</script>

<style scoped>
.guided-tour {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    pointer-events: auto;
}

.tour-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.tour-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.tour-spotlight-ring {
    position: absolute;
    border: 3px solid #8b5cf6;
    border-radius: 16px;
    box-shadow:
        0 0 0 4px rgba(139, 92, 246, 0.3),
        0 0 30px 10px rgba(139, 92, 246, 0.2);
    animation: pulse-ring 2s ease-in-out infinite;
    pointer-events: none;
}

@keyframes pulse-ring {

    0%,
    100% {
        box-shadow:
            0 0 0 4px rgba(139, 92, 246, 0.3),
            0 0 30px 10px rgba(139, 92, 246, 0.2);
    }

    50% {
        box-shadow:
            0 0 0 8px rgba(139, 92, 246, 0.2),
            0 0 40px 15px rgba(139, 92, 246, 0.15);
    }
}

.tour-tooltip {
    position: absolute;
    width: 360px;
    background: white;
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.3);
    animation: tooltip-enter 0.3s ease-out;
}

@keyframes tooltip-enter {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tour-tooltip::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    background: white;
    transform: rotate(45deg);
}

.tour-tooltip--top::before {
    bottom: -8px;
    left: 50%;
    margin-left: -8px;
}

.tour-tooltip--bottom::before {
    top: -8px;
    left: 50%;
    margin-left: -8px;
}

.tour-tooltip--left::before {
    right: -8px;
    top: 50%;
    margin-top: -8px;
}

.tour-tooltip--right::before {
    left: -8px;
    top: 50%;
    margin-top: -8px;
}

.tour-progress {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
}

.tour-progress-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e5e7eb;
    transition: all 0.3s ease;
}

.tour-progress-dot--active {
    width: 24px;
    border-radius: 4px;
    background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.tour-progress-dot--completed {
    background: #10b981;
}

.tour-content {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
}

.tour-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.tour-icon .mdi {
    font-size: 24px;
    color: white;
}

.tour-text {
    flex: 1;
}

.tour-title {
    font-size: 18px;
    font-weight: 700;
    color: #2d2d3a;
    margin: 0 0 8px;
}

.tour-description {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.5;
    margin: 0;
}

.tour-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
}

.tour-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.tour-btn--primary {
    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
    color: white;
    flex: 1;
}

.tour-btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.tour-btn--secondary {
    background: #f3f4f6;
    color: #374151;
}

.tour-btn--secondary:hover {
    background: #e5e7eb;
}

.tour-btn--skip {
    background: transparent;
    color: #9ca3af;
    padding: 10px;
}

.tour-btn--skip:hover {
    color: #6b7280;
}

.tour-counter {
    text-align: center;
    font-size: 13px;
    color: #9ca3af;
    font-weight: 600;
}

/* Transition */
.tour-fade-enter-active,
.tour-fade-leave-active {
    transition: opacity 0.3s ease;
}

.tour-fade-enter-from,
.tour-fade-leave-to {
    opacity: 0;
}
</style>
