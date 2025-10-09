import { useState } from 'react'

/**
 * Custom hook for managing toast notifications
 */
export function useToast() {
  const [toastMessage, setToastMessage] = useState('')
  const [showToast, setShowToast] = useState(false)

  const showToastNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  return {
    toastMessage,
    showToast,
    showToastNotification
  }
}
