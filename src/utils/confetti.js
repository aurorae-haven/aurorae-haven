import confetti from 'canvas-confetti'

/**
 * Confetti effect using canvas-confetti library
 * TAB-HAB-24: Confetti for milestone celebrations
 * TAB-HAB-41: Reduced motion alternative
 */

/**
 * Trigger confetti animation
 * @param {object} options - Configuration options
 * @param {boolean} options.reducedMotion - Whether user prefers reduced motion
 */
export function triggerConfetti({ reducedMotion = false } = {}) {
  if (reducedMotion) {
    // TAB-HAB-41: Static celebratory outline for reduced motion users
    const celebrationDiv = document.createElement('div')
    celebrationDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 2rem 3rem;
      background: linear-gradient(135deg, #86f5e0 0%, #4a7dff 100%);
      border-radius: 16px;
      box-shadow: 0 0 0 4px #86f5e0, 0 0 40px rgba(134, 245, 224, 0.5);
      color: #0e1117;
      font-size: 2rem;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
    `
    celebrationDiv.textContent = '🎉 Milestone!'
    document.body.appendChild(celebrationDiv)

    setTimeout(() => {
      celebrationDiv.remove()
    }, 2000)
    return
  }

  // Full animation using canvas-confetti library
  const colors = ['#86f5e0', '#4a7dff', '#ff6b6b', '#ffd93d', '#a78bfa']

  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors
  })
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
