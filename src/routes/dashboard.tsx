import { createFileRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/authStore"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
      })
    }
  },

  component: DashboardPage,
})

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">TaskFlow</h1>
            <p className="text-sm text-slate-500">
              Kanban Task Board
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <h2 className="text-3xl font-bold">
          Welcome, {user?.name}
        </h2>

        <p className="mt-2 text-slate-600">
          Manage your tasks and track your progress.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Tasks" value="0" />
          <StatCard title="To Do" value="0" />
          <StatCard title="In Progress" value="0" />
          <StatCard title="Completed" value="0" />
        </div>
      </section>
    </main>
  )
}

interface StatCardProps {
  title: string
  value: string
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}