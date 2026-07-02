import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Loader2, Eye, EyeOff, Info, ArrowLeft } from "lucide-react";
import { GoogleAuthButton } from "../../../common/components/ui/google-auth-button";
import { MicrosoftAuthButton } from "../../../common/components/ui/microsoft-auth-button";
import { Alert, AlertDescription, AlertTitle } from "../../../common/components/ui/alert";
import axios from "axios";
import { authService } from "../services/authService";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

const otpSchema = z.object({
  otp: z.string().length(4, { message: "OTP must be 4 characters" }),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const LoginForm = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("login"); // login | forgot | otp | reset
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(
      step === "login" ? loginSchema :
      step === "forgot" ? forgotPasswordSchema :
      step === "otp" ? otpSchema : resetPasswordSchema
    ),
    defaultValues: {
      email: "",
      password: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      if (step === "login") {
        await login(data.email, data.password);
        navigate("/dashboard");
      } else if (step === "forgot") {
        setEmail(data.email);
        await authService.forgotPassword(data.email);
        setSuccess("OTP sent to your email successfully!");
        setTimeout(() => {
          setStep("otp");
          setSuccess("");
        }, 1500);
      } else if (step === "otp") {
        await authService.verifyOtp(email, data.otp);
        setSuccess("OTP verified successfully!");
        setTimeout(() => {
          setStep("reset");
          setSuccess("");
        }, 1500);
      } else if (step === "reset") {
        await authService.resetPassword(email, data.otp, data.newPassword);
        setSuccess("Password reset successfully! Please login with new password.");
        setTimeout(() => {
          setStep("login");
          setSuccess("");
          reset();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || err.msg || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === "otp") {
      setStep("forgot");
    } else if (step === "reset") {
      setStep("otp");
    } else {
      setStep("login");
    }
    setError("");
    setSuccess("");
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      
      if (res.data && res.data.email) {
        await googleLogin(res.data.email);
        navigate("/dashboard");
      } else {
        throw new Error("Could not retrieve email from Google");
      }
    } catch (err) {
      setError(err.message || "Google Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google Login failed. Please try again.");
  };

  const getStepContent = () => {
    if (step === "login") {
      return (
        <>
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Login</h1>
            <p className="text-sm text-slate-500">
              Enter your email and password to access your account.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 pr-10 ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep("forgot")}
                  className="text-sm text-slate-600 hover:text-slate-800 hover:underline underline-offset-2"
                >
                  Forgot password?
                </button>
              </div>
              {error && (
                <Alert variant="destructive">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <Info className="h-4 w-4" />
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
                    Logging in...
                  </>
                ) : (
                  "Login"
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
                  text="Sign in with Google"
                />
              </div>
              <div className="flex justify-center w-full">
                <MicrosoftAuthButton text="Sign in with Microsoft" />
              </div>
            </div>
          </form>
        </>
      );
    } else if (step === "forgot") {
      return (
        <>
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Forgot Password</h1>
            <p className="text-sm text-slate-500">
              Enter your email address and we'll send you an OTP to reset your password.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
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
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={goBack} className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </>
      );
    } else if (step === "otp") {
      return (
        <>
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Enter OTP</h1>
            <p className="text-sm text-slate-500">
              Enter the 4-digit OTP sent to your email.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-slate-700">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="1234"
                  maxLength={4}
                  {...register("otp")}
                  className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 text-center text-xl tracking-widest ${errors.otp ? "border-destructive" : ""}`}
                />
                {errors.otp && (
                  <p className="text-sm text-destructive">{errors.otp.message}</p>
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
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={goBack} className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </>
      );
    } else if (step === "reset") {
      return (
        <>
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reset Password</h1>
            <p className="text-sm text-slate-500">
              Enter your new password.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-700">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...register("newPassword")}
                    className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 pr-10 ${errors.newPassword ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    {...register("confirmPassword")}
                    className={`bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-400 pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={goBack} className="flex-1" disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" className="flex-1 bg-slate-900 text-white hover:bg-slate-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </>
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {getStepContent()}
    </div>
  );
};
