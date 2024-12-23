import { AxiosError } from 'axios'

export const useErrorHandler = () => {
  const handleError = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data

      if (apiError?.errorMessages) {
        return (
          apiError.errorMessages.map((err: { message: string }) => `${err.message}`).join('. \n') +
          '.'
        )
      }

      return apiError?.message || 'An unexpected error occurred.'
    }

    if (error instanceof Error) {
      return error.message || 'An unknown error occurred.'
    }

    return 'An unexpected error occurred.'
  }

  return { handleError }
}
