import { create } from "zustand"
import type { User } from "@/types/auth"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  register: (name: string, email: string, password: string) => void
  login: (email: string, password: string) => void
  logout: () => void
  initialize: () => void
}

const USERS_KEY = "taskflow_users"
const CURRENT_USER_KEY = "taskflow_current_user"

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  initialize: () => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY)

    if (storedUser) {
      const user = JSON.parse(storedUser) as User

      set({
        user,
        isAuthenticated: true,
      })
    }
  },

  register: (name, email, password) => {
    const storedUsers = localStorage.getItem(USERS_KEY)

    const users: User[] = storedUsers
      ? JSON.parse(storedUsers)
      : []

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    )

    if (existingUser) {
      throw new Error("An account with this email already exists.")
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([...users, newUser]),
    )

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(newUser),
    )

    set({
      user: newUser,
      isAuthenticated: true,
    })
  },

  login: (email, password) => {
    const storedUsers = localStorage.getItem(USERS_KEY)

    const users: User[] = storedUsers
      ? JSON.parse(storedUsers)
      : []

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password,
    )

    if (!user) {
      throw new Error("Invalid email or password.")
    }

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(user),
    )

    set({
      user,
      isAuthenticated: true,
    })
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY)

    set({
      user: null,
      isAuthenticated: false,
    })
  },
}))