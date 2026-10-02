import { useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import type {
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { LogOut, Plus, Pencil, Trash2 } from "lucide-react"

import { useAuthStore } from "@/stores/authStore"
import { useTaskStore } from "@/stores/taskStore"
import type { Task, TaskStatus } from "@/types/task"

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
  const [showInput, setShowInput] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const userTasks = tasks.filter(
    (task) => task.userId === user?.id,
  )
const activities = useTaskStore((state) => state.activities)
const userActivities = activities.filter(
  (activity) => activity.userId === user?.id,
)

const todoTasks = userTasks.filter(
  (task) => task.status === "TODO",
)

const inProgressTasks = userTasks.filter(
  (task) => task.status === "IN_PROGRESS",
)

const reviewTasks = userTasks.filter(
  (task) => task.status === "REVIEW",
)

const completedTasks = userTasks.filter(
  (task) => task.status === "COMPLETED",
)

const stats = {
  total: userTasks.length,
  todo: todoTasks.length,
  inProgress: inProgressTasks.length,
  review: reviewTasks.length,
  completed: completedTasks.length,
}

const recentActivities = [...userActivities]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  )
  .slice(0, 5)
const handleCreateTask = () => {
  if (!user) return

  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return
  }

  if (trimmedTitle.length > 100) {
    return
  }

  createTask(user.id, trimmedTitle)
  setTitle("")
  setShowInput(false)
}

  const handleEditStart = (
    taskId: string,
    taskTitle: string,
  ) => {
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

const handleDragStart = (event: DragStartEvent) => {
  const task = userTasks.find(
    (item) => item.id === String(event.active.id),
  )

  setActiveTask(task ?? null)
}

const handleDragEnd = (event: DragEndEvent) => {
  setActiveTask(null)

  const { active, over } = event

  if (!over || !user) return

  const taskId = String(active.id)
  const newStatus = String(over.id) as TaskStatus

  const task = userTasks.find(
    (item) => item.id === taskId,
  )

  if (!task) return

  if (task.status === newStatus) return

  updateTask(user.id, taskId, {
    status: newStatus,
  })
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
            <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-sm font-medium text-white">
              {user ? getInitials(user.name) : "U"}
            </div>

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

      {/* Main */}
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

        {/* Create Task */}
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
{/* Statistics */}
<div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
  <StatCard
    label="Total Tasks"
    value={stats.total}
  />

  <StatCard
    label="To Do"
    value={stats.todo}
  />

  <StatCard
    label="In Progress"
    value={stats.inProgress}
  />
  <StatCard
    label="Review"
    value={stats.review}
  />
  <StatCard
    label="Completed"
    value={stats.completed}
  />
</div>
        {/* Kanban */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {columns.map((column) => {
              const columnTasks = userTasks.filter(
                (task) => task.status === column.status,
              )

              return (
                <KanbanColumn
                  key={column.status}
                  status={column.status}
                  title={column.title}
                  tasks={columnTasks}
                  editingTaskId={editingTaskId}
                  editingTitle={editingTitle}
                  setEditingTitle={setEditingTitle}
                  onEditStart={handleEditStart}
                  onEditSave={handleEditSave}
                  onEditCancel={() => {
                    setEditingTaskId(null)
                    setEditingTitle("")
                  }}
                  onDelete={handleDelete}
                />
              )
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <TaskCardPreview task={activeTask} />
            ) : null}
          </DragOverlay>
        </DndContext>
        {/* Recent Activity */}
<div className="mt-10">
  <h2 className="text-xl font-semibold">
    Recent Activity
  </h2>

  <div className="mt-4 rounded-xl border bg-white">
    {recentActivities.length === 0 ? (
      <div className="p-6 text-center text-sm text-slate-500">
        No activity yet.
      </div>
    ) : (
      <div className="divide-y">
        {recentActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <p className="text-sm text-slate-700">
              {activity.message}
            </p>

            <span className="shrink-0 text-xs text-slate-400">
              {new Date(activity.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
      </section>
    </main>
  )
}

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  tasks: Task[]
  editingTaskId: string | null
  editingTitle: string
  setEditingTitle: (value: string) => void
  onEditStart: (
    taskId: string,
    title: string,
  ) => void
  onEditSave: () => void
  onEditCancel: () => void
  onDelete: (taskId: string) => void
}

function KanbanColumn({
  status,
  title,
  tasks,
  editingTaskId,
  editingTitle,
  setEditingTitle,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] rounded-xl border p-4 transition-colors ${
        isOver
          ? "border-slate-400 bg-slate-100"
          : "bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {title}
        </h3>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTaskCard
            key={task.id}
            task={task}
            isEditing={editingTaskId === task.id}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
            onEditStart={onEditStart}
            onEditSave={onEditSave}
            onEditCancel={onEditCancel}
            onDelete={onDelete}
          />
        ))}

        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}

interface DraggableTaskCardProps {
  task: Task
  isEditing: boolean
  editingTitle: string
  setEditingTitle: (value: string) => void
  onEditStart: (
    taskId: string,
    title: string,
  ) => void
  onEditSave: () => void
  onEditCancel: () => void
  onDelete: (taskId: string) => void
}

function DraggableTaskCard({
  task,
  isEditing,
  editingTitle,
  setEditingTitle,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-lg border bg-slate-50 p-4 shadow-sm transition-opacity ${
        isDragging ? "opacity-40" : "opacity-100"
      }`}
    >
      {isEditing ? (
        <div
          className="space-y-2"
          onPointerDown={(event) =>
            event.stopPropagation()
          }
        >
          <Input
            autoFocus
            value={editingTitle}
            onChange={(event) =>
              setEditingTitle(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onEditSave()
              }

              if (event.key === "Escape") {
                onEditCancel()
              }
            }}
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onEditSave}
            >
              Save
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onEditCancel}
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

          <div
            className="mt-3 flex gap-2"
            onPointerDown={(event) =>
              event.stopPropagation()
            }
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                onEditStart(task.id, task.title)
              }
            >
              <Pencil className="mr-1 size-3" />
              Edit
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="mr-1 size-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
function StatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border bg-white px-5 py-4">
      <p className="text-sm text-slate-900">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}

function TaskCardPreview({ task }: { task: Task }) {
  return (
    <div className="w-64 rounded-lg border bg-white p-4 shadow-lg">
      <p className="text-sm font-medium">
        {task.title}
      </p>
    </div>
  )
}