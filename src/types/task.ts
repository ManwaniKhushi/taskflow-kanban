export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}