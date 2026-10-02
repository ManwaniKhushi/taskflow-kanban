import { create } from "zustand"
import type { Task, TaskStatus } from "@/types/task"
import type { Activity, ActivityType } from "@/types/activity"

interface TaskState {
  tasks: Task[]
  activities: Activity[]

  initialize: () => void

  createTask: (
    userId: string,
    title: string,
    status?: TaskStatus,
  ) => void

  updateTask: (
    userId: string,
    taskId: string,
    updates: {
      title?: string
      status?: TaskStatus
    },
  ) => void

  deleteTask: (userId: string, taskId: string) => void

  getUserTasks: (userId: string) => Task[]
  getUserActivities: (userId: string) => Activity[]
}

const TASKS_KEY = "taskflow_tasks"
const ACTIVITIES_KEY = "taskflow_activities"

function saveTasks(tasks: Task[]) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

function saveActivities(activities: Activity[]) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
}

function createActivity(
  userId: string,
  type: ActivityType,
  message: string,
): Activity {
  return {
    id: crypto.randomUUID(),
    userId,
    type,
    message,
    createdAt: new Date().toISOString(),
  }
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activities: [],

  initialize: () => {
    const storedTasks = localStorage.getItem(TASKS_KEY)
    const storedActivities = localStorage.getItem(ACTIVITIES_KEY)

    set({
      tasks: storedTasks ? JSON.parse(storedTasks) : [],
      activities: storedActivities
        ? JSON.parse(storedActivities)
        : [],
    })
  },

  createTask: (userId, title, status = "TODO") => {
    const now = new Date().toISOString()

    const newTask: Task = {
      id: crypto.randomUUID(),
      userId,
      title,
      status,
      createdAt: now,
      updatedAt: now,
    }

    const activity = createActivity(
      userId,
      "CREATED_TASK",
      `Created task "${title}"`,
    )

    const tasks = [...get().tasks, newTask]
    const activities = [...get().activities, activity]

    saveTasks(tasks)
    saveActivities(activities)

    set({ tasks, activities })
  },

  updateTask: (userId, taskId, updates) => {
    const task = get().tasks.find(
      (item) =>
        item.id === taskId &&
        item.userId === userId,
    )

    if (!task) {
      throw new Error("Task not found.")
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    const tasks = get().tasks.map((item) =>
      item.id === taskId && item.userId === userId
        ? updatedTask
        : item,
    )

    const activityType: ActivityType =
      updates.status === "COMPLETED"
        ? "COMPLETED_TASK"
        : "UPDATED_TASK"

    const activity = createActivity(
      userId,
      activityType,
      updates.status === "COMPLETED"
        ? `Completed task "${task.title}"`
        : `Updated task "${task.title}"`,
    )

    const activities = [
      ...get().activities,
      activity,
    ]

    saveTasks(tasks)
    saveActivities(activities)

    set({ tasks, activities })
  },

  deleteTask: (userId, taskId) => {
    const task = get().tasks.find(
      (item) =>
        item.id === taskId &&
        item.userId === userId,
    )

    if (!task) {
      throw new Error("Task not found.")
    }

    const tasks = get().tasks.filter(
      (item) =>
        !(
          item.id === taskId &&
          item.userId === userId
        ),
    )

    const activity = createActivity(
      userId,
      "DELETED_TASK",
      `Deleted task "${task.title}"`,
    )

    const activities = [
      ...get().activities,
      activity,
    ]

    saveTasks(tasks)
    saveActivities(activities)

    set({ tasks, activities })
  },

  getUserTasks: (userId) => {
    return get().tasks.filter(
      (task) => task.userId === userId,
    )
  },

  getUserActivities: (userId) => {
    return get().activities.filter(
      (activity) => activity.userId === userId,
    )
  },
}))