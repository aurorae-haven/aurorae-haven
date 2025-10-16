/**
 * Simple CSS-based confetti effect
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

  // Full animation for users without reduced motion preference
  const colors = ['#86f5e0', '#4a7dff', '#ff6b6b', '#ffd93d', '#a78bfa']
  const confettiCount = 50
  const confettiElements = []

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div')
    const color = colors[Math.floor(Math.random() * colors.length)]
    const size = Math.random() * 10 + 5
    const startX = Math.random() * window.innerWidth
    const duration = Math.random() * 2 + 1
    const delay = Math.random() * 0.5
    
    confetti.style.cssText = `
      position: fixed;
      top: -10px;
      left: ${startX}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events: none;
      z-index: 10000;
      animation: confetti-fall ${duration}s linear ${delay}s forwards;
    `
    
    document.body.appendChild(confetti)
    confettiElements.push(confetti)
  }

  // Add animation keyframes if not already present
  if (!document.getElementById('confetti-keyframes')) {
    const style = document.createElement('style')
    style.id = 'confetti-keyframes'
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(0) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  // Clean up after animation
  setTimeout(() => {
    confettiElements.forEach(el => el.remove())
  }, 3500)
}

/**
 * Check if user prefers reduced motion
 * @returns {boolean} True if reduced motion is preferred
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
