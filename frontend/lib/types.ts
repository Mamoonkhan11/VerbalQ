export interface User {
  id: string
  email: string
  name?: string
  role: "user" | "admin"
  createdAt: Date
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: Omit<User, "password">
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}
