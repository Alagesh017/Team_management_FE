import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Loader2, Eye, EyeOff, CheckCircle2, Info } from "lucide-react";
import { GoogleAuthButton } from "../../../common/components/ui/google-auth-button";
import { YahooAuthButton } from "../../../common/components/ui/yahoo-auth-button";
import { Alert, AlertDescription, AlertTitle } from "../../../common/components/ui/alert";
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const LoginForm = () => {
  const { login, googleLogin, yahooLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setError("");
    setIsLoading(true);
    try {
      // Fetch user info from Google using the access token
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

  const handleYahooSuccess = async (email) => {
    setError("");
    setIsLoading(true);
    try {
      await yahooLogin(email);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Yahoo Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleYahooError = () => {
    setError("Yahoo Login failed. Please try again.");
  };

  return (
    <div className="w-full space-y-6">
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
          {error && (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
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
            <YahooAuthButton
              onSuccess={handleYahooSuccess}
              onError={handleYahooError}
              text="Sign in with Yahoo"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
