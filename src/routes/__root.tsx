import { Outlet, createRootRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/authStore"

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return <Outlet />
}