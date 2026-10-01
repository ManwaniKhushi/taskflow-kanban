export type ActivityType =
  | "CREATED_TASK"
  | "UPDATED_TASK"
  | "COMPLETED_TASK"
  | "DELETED_TASK"

export interface Activity {
  id: string
  userId: string
  type: ActivityType
  message: string
  createdAt: string
}