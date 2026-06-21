export interface LoginInput {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
  boardId?: string | null
}

export interface LoginResponse {
  user: AuthUser
  token: string
}
