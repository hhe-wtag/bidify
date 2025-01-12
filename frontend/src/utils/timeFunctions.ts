export const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  export const calculateTimeRemaining = (endTime: string): string => {
    const end = new Date(endTime).getTime()
    const now = new Date().getTime()
    const distance = end - now
  
    if (distance < 0) return 'Auction Ended'
  
    const days = Math.floor(distance / (1000 * 60 * 60 * 24))
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((distance % (1000 * 60)) / 1000)
  
    return `${days}d ${hours}h ${minutes}m ${seconds}s`
  }