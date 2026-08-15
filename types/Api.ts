export interface PaginationResponse {
  total: number
  limit: number
  nextCursor: string | null
}

export interface ConflictData {
  field: string
  existingData?: any
}

export interface ApiResponse<T> {
  status: number
  data: T
  error?: string
  conflict?: ConflictData
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: PaginationResponse
}
