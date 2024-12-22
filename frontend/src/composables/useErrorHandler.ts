import { AxiosError } from 'axios'

export const useErrorHandler = () => {
  const handleError = (error: unknown): string => {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || 'An unexpected error occurred.'
    }

    if (error instanceof Error) {
      return error.message || 'An unknown error occurred.'
    }

    return 'An unexpected error occurred.'
  }

  return { handleError }
}
