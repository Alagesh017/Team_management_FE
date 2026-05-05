import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../common/components/ui/select";
import { Loader2, Eye, EyeOff, CheckCircle2, Info, X } from "lucide-react";
import { GoogleAuthButton } from "../../../common/components/ui/google-auth-button";
import { Alert, AlertDescription, AlertTitle } from "../../../common/components/ui/alert";
import axios from "axios";

const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .max(50, { message: "First name must be less than 50 characters" })
      .regex(/^[a-zA-Z\s]*$/, { message: "First name can only contain letters" }),
    last_name: z
      .string()
      .min(1, { message: "Last name is required" })
      .max(50, { message: "Last name must be less than 50 characters" })
      .regex(/^[a-zA-Z\s]*$/, { message: "Last name can only contain letters" }),
    email: z.string().email({ message: "Invalid email address" }).toLowerCase().trim(),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{10}$/.test(val), {
        message: "Phone number must be exactly 10 digits",
      }),
    role: z.enum(["superadmin", "admin", "scrum", "team_leader", "worker"], {
      errorMap: () => ({ message: "Please select a valid role" }),
    }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegisterForm = () => {
  const { googleLogin } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGooglePrefilled, setIsGooglePrefilled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    resetField,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "worker",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = watch("role");
  const emailValue = watch("email");

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      await authService.register(registerData);
      setSuccess("Account created successfully! You can now login.");
    } catch (err) {
      setError(err.msg || err.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });

      if (res.data && res.data.email) {
        // Instead of logging in, we prefill the details for registration
        setValue("email", res.data.email);
        if (res.data.given_name) setValue("first_name", res.data.given_name);
        if (res.data.family_name) setValue("last_name", res.data.family_name);
        setIsGooglePrefilled(true);
        setSuccess("Details prefilled from Google. Please complete your registration.");
      } else {
        throw new Error("Could not retrieve email from Google");
      }
    } catch (err) {
      setError(err.message || "Google fetch failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearGoogleEmail = () => {
    resetField("email");
    setIsGooglePrefilled(false);
    setSuccess("");
  };

  const handleGoogleError = () => {
    setError("Google Signup failed. Please try again.");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h1>
        <p className="text-sm text-slate-500">
          Enter your details below to create your account.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-slate-700">First Name</Label>
              <Input
                id="first_name"
                placeholder="John"
                {...register("first_name")}
                className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 ${errors.first_name ? "border-destructive" : ""}`}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-slate-700">Last Name</Label>
              <Input
                id="last_name"
                placeholder="Doe"
                {...register("last_name")}
                className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 ${errors.last_name ? "border-destructive" : ""}`}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                disabled={isGooglePrefilled}
                className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 pr-10 ${errors.email ? "border-destructive" : ""} ${isGooglePrefilled ? "bg-slate-50 cursor-not-allowed" : ""}`}
              />
              {isGooglePrefilled && (
                <button
                  type="button"
                  onClick={clearGoogleEmail}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear Google Email"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-slate-700">Phone (Optional)</Label>
            <Input
              id="phone"
              placeholder="1234567890"
              {...register("phone")}
              className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 ${errors.phone ? "border-destructive" : ""}`}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" title="Password must be at least 8 characters, include uppercase, lowercase, number and special character" className="text-slate-700 flex items-center gap-1">
                Password <Info className="h-3 w-3 text-slate-400" />
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 pr-10 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700">Role</Label>
            <Select
              onValueChange={(value) => setValue("role", value)}
              defaultValue={selectedRole}
            >
              <SelectTrigger className="bg-white border-slate-200 text-slate-900 focus:ring-slate-400">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 text-slate-900">
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="scrum">Scrum Master</SelectItem>
                <SelectItem value="team_leader">Team Leader</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>
          {error && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
        <div className="flex flex-col space-y-4">
          <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Register"
            )}
          </Button>

          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            <GoogleAuthButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text="Sign up with Google"
            />
          </div>

          <div className="text-sm text-center text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-slate-900 hover:underline font-medium">
              Login
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
