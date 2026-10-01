import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold">TaskFlow</h1>
        <p className="mt-2 text-slate-600">
          Your Kanban Task Board
        </p>
      </div>
    </main>
  )
}