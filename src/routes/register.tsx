import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  registerSchema,
  type RegisterFormData,
} from "@/schemas/authSchema"

import { useAuthStore } from "@/stores/authStore"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/register")({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useAuthStore((state) => state.register)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    try {
      setError("")

      registerUser(
        data.name,
        data.email,
        data.password,
      )

      navigate({
        to: "/dashboard",
      })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create account",
      )
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            Create your account
          </CardTitle>

          <CardDescription>
            Start managing your tasks with TaskFlow
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name">
                Full name
              </Label>

              <Input
                id="name"
                placeholder="Your name"
                {...register("name")}
              />

              {errors.name && (
                <p className="text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm password
              </Label>

              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />

              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating account..."
                : "Create account"}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-slate-900 underline"
              >
                Login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}