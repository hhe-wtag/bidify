import { toast } from '@/components/ui/toast'

export const emitToastForWSDisconnet = () => {
  toast({
    title: 'WebSocket Disconnected!',
    description: 'Live data service is not available. Please refresh or login again.',
    class: 'bg-red-200',
  })
}
export const emitToastForWSConnect = () => {
  toast({
    title: 'WebSocket Connected!',
    description: 'Live data service is available.',
    class: 'bg-green-100',
  })
}
