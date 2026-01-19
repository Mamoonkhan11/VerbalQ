import { AxiosError } from 'axios'
import { useToast } from '@/hooks/use-toast'

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export function handleApiError(error: unknown, toast: ReturnType<typeof useToast>['toast']): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data

    // Handle different error types
    switch (status) {
      case 400:
        return {
          message: data?.message || 'Bad request. Please check your input.',
          status
        }
      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          status
        }
      case 403:
        return {
          message: data?.message || 'You do not have permission to perform this action.',
          status
        }
      case 404:
        return {
          message: 'The requested resource was not found.',
          status
        }
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          status
        }
      case 500:
        return {
          message: 'Server error. Please try again later.',
          status
        }
      case 503:
        return {
          message: data?.message || 'Service temporarily unavailable. Please try again later.',
          status
        }
      default:
        return {
          message: data?.message || error.message || 'An unexpected error occurred.',
          status
        }
    }
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR'
    }
  }

  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR'
  }
}

export function showErrorToast(error: unknown, toast: ReturnType<typeof useToast>['toast']) {
  const apiError = handleApiError(error, toast)

  toast({
    title: "❌ Error",
    description: apiError.message,
    className: "border-red-200 bg-transparent text-red-800",
  })

  return apiError
}

export function showSuccessToast(message: string, toast: ReturnType<typeof useToast>['toast']) {
  toast({
    title: "✅ Success",
    description: message,
    className: "border-green-200 bg-transparent text-green-800",
  })
}

// Utility function to wrap async operations with error handling
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
  toast: ReturnType<typeof useToast>['toast'],
  successMessage?: string
): Promise<T | null> {
  try {
    const result = await operation()
    if (successMessage) {
      showSuccessToast(successMessage, toast)
    }
    return result
  } catch (error) {
    showErrorToast(error, toast)
    return null
  }
}