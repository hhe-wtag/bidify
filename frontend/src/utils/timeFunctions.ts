export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString))
}

export const calculateTimeRemaining = (endTime: string): string => {
  const end = new Date(endTime).getTime()
  const now = new Date().getTime()
  const distance = end - now

  if (distance < 0) return '0d 0h 0m 0s'

  const days = Math.floor(distance / (1000 * 60 * 60 * 24))
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((distance % (1000 * 60)) / 1000)

  return `${days}d ${hours}h ${minutes}m ${seconds}s`
}
