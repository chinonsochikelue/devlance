"use client"

import { cn } from "@/lib/utils"
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
import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Joi from "joi"
import { useAuth } from "@/lib/auth"

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),
  password: Joi.string().min(6).max(280).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must not exceed 280 characters",
  }),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const { setUser } = useAuth()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    // Stop input at 280 characters
    if (id === "password" && value.length > 280) return

    setFormData({ ...formData, [id]: value })
    setErrors({ ...errors, [id]: "" })
  }

  const validateForm = () => {
    const { error } = loginSchema.validate(formData, { abortEarly: false })
    if (!error) {
      setErrors({ email: "", password: "" })
      return true
    }

    const newErrors: Record<string, string> = { email: "", password: "" }
    error.details.forEach((err) => {
      const field = err.path[0] as string
      newErrors[field] = err.message
    })

    setErrors(newErrors)
    return false
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError("");
  
    try {
      setLoading(true);
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.error || "An error occurred. Please try again.",
        });
        return;
      }
  
      if (data.error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.error,
        });
        return;
      }
  
      setUser(data)

      toast({
        variant: "default",
        title: "Login successful",
        description: "Welcome back!",
      });
  
      router.push("/home");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Something went wrong, Please try again.",
      });
      console.error("Error during login:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-transparent md:border-none">
        <CardHeader>
          <h1 className="text-4xl font-bold text-white text-center">Welcome back To Devlance!</h1>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Please enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>
              <div className="grid gap-2 relative">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute right-3 top-10 text-muted-foreground cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                className="w-full flex justify-center items-center"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                {loading ? "Logging In..." : "Login"}
              </Button>

              <Button variant="outline" className="w-full" type="button">
                Login with Google
              </Button>
            </div>
            <div className="mt-4 text-center text-gray-100 dark:text-gray-100 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
