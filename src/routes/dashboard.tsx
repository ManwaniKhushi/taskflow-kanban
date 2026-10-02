import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { LogOut, Plus } from "lucide-react"

import { useAuthStore } from "@/stores/authStore"
import { useTaskStore } from "@/stores/taskStore"
import type { TaskStatus } from "@/types/task"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

const columns: {
  status: TaskStatus
  title: string
}[] = [
  {
    status: "TODO",
    title: "TODO",
  },
  {
    status: "IN_PROGRESS",
    title: "IN PROGRESS",
  },
  {
    status: "REVIEW",
    title: "REVIEW",
  },
  {
    status: "COMPLETED",
    title: "COMPLETED",
  },
]

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const tasks = useTaskStore((state) => state.tasks)
const createTask = useTaskStore((state) => state.createTask)
const updateTask = useTaskStore((state) => state.updateTask)
const deleteTask = useTaskStore((state) => state.deleteTask)
  const [title, setTitle] = useState("")
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
const [editingTitle, setEditingTitle] = useState("")
  const [showInput, setShowInput] = useState(false)

  const userTasks = tasks.filter(
    (task) => task.userId === user?.id,
  )

  const handleCreateTask = () => {
    if (!user || !title.trim()) return

    createTask(user.id, title.trim())

    setTitle("")
    setShowInput(false)
  }
const handleEditStart = (taskId: string, taskTitle: string) => {
  setEditingTaskId(taskId)
  setEditingTitle(taskTitle)
}

const handleEditSave = () => {
  if (!user || !editingTaskId || !editingTitle.trim()) {
    return
  }

  updateTask(user.id, editingTaskId, {
    title: editingTitle.trim(),
  })

  setEditingTaskId(null)
  setEditingTitle("")
}

const handleDelete = (taskId: string) => {
  if (!user) return

  deleteTask(user.id, taskId)
}
  const handleLogout = () => {
    logout()
    window.location.href = "/login"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              TaskFlow
            </h1>

            <p className="text-sm text-slate-500">
              Kanban Task Board
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {user ? getInitials(user.name) : "U"}
              </AvatarFallback>
            </Avatar>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user?.name}
              </p>

              <p className="text-xs text-slate-500">
                {user?.email}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              My Tasks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Organize your work and track your progress.
            </p>
          </div>

          <Button
            onClick={() => setShowInput((value) => !value)}
          >
            <Plus className="mr-2 size-4" />
            Create Task
          </Button>
        </div>

        {/* Create task */}
        {showInput && (
          <div className="mt-6 flex max-w-xl gap-2">
            <Input
              autoFocus
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleCreateTask()
                }
              }}
              placeholder="Enter task title..."
            />

            <Button onClick={handleCreateTask}>
              Create
            </Button>
          </div>
        )}

        {/* Kanban board */}
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((column) => {
            const columnTasks = userTasks.filter(
              (task) => task.status === column.status,
            )

            return (
              <div
                key={column.status}
                className="min-h-[400px] rounded-xl border bg-white p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {column.title}
                  </h3>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                 {columnTasks.map((task) => (
  <div
    key={task.id}
    className="rounded-lg border bg-slate-50 p-4 shadow-sm"
  >
    {editingTaskId === task.id ? (
      <div className="space-y-2">
        <Input
          autoFocus
          value={editingTitle}
          onChange={(event) =>
            setEditingTitle(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleEditSave()
            }

            if (event.key === "Escape") {
              setEditingTaskId(null)
              setEditingTitle("")
            }
          }}
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleEditSave}
          >
            Save
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingTaskId(null)
              setEditingTitle("")
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    ) : (
      <div>
        <p className="text-sm font-medium">
          {task.title}
        </p>

        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              handleEditStart(task.id, task.title)
            }
          >
            Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(task.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    )}
  </div>
))}

                  {columnTasks.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
    )}