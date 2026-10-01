import { useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { loginSchema, type LoginFormData } from "@/schemas/authSchema"
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

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    try {
      setError("")
      login(data.email, data.password)

      navigate({
        to: "/dashboard",
      })
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to login",
      )
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back
          </CardTitle>

          <CardDescription>
            Login to your TaskFlow account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
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
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-slate-900 underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}