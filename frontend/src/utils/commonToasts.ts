import { toast } from '@/components/ui/toast'

export const emitToastForWSDisconnet = () => {
  toast({
    title: 'WebSocket Disconnected',
    description: 'Live data service is not available. Please refresh or login again.',
    variant: 'destructive',
  })
}
