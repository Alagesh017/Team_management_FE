import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { Button } from "../../../common/components/ui/button";
import { Input } from "../../../common/components/ui/input";
import { Label } from "../../../common/components/ui/label";
import { Loader2, CheckCircle2, Info } from "lucide-react";
import { GoogleAuthButton } from "../../../common/components/ui/google-auth-button";
import { MicrosoftAuthButton } from "../../../common/components/ui/microsoft-auth-button";
import { Alert, AlertDescription, AlertTitle } from "../../../common/components/ui/alert";
import axios from "axios";

const registerSchema = z.object({
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
});

export const RegisterForm = () => {
  const { googleLogin, microsoftLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
    },
  });

  // Check for Microsoft prefill data on component mount and auto-register
  useEffect(() => {
    const microsoftPrefill = localStorage.getItem("microsoftRegisterPrefill");
    if (microsoftPrefill) {
      try {
        const accountData = JSON.parse(microsoftPrefill);
        autoRegisterWithMicrosoft(accountData);
        localStorage.removeItem("microsoftRegisterPrefill");
      } catch (err) {
        console.error("Error parsing Microsoft prefill data:", err);
        localStorage.removeItem("microsoftRegisterPrefill");
      }
    }
  }, []);

  const autoRegisterWithMicrosoft = async (accountData) => {
    setIsLoading(true);
    try {
      // First, try to log in directly
      await microsoftLogin(accountData.email);
      navigate("/dashboard");
    } catch (loginErr) {
      // If login fails, try to register
      try {
        await authService.register({
          first_name: accountData.first_name || "",
          last_name: accountData.last_name || "",
          email: accountData.email,
          phone: "",
          role: "superadmin",
        });
        // After registration, log in
        await microsoftLogin(accountData.email);
        navigate("/dashboard");
      } catch (registerErr) {
        setError(registerErr.msg || registerErr.error || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      // Register with role = superadmin
      await authService.register({ ...data, role: "superadmin" });
      setSuccess("Account created successfully!");
      navigate("/login");
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
        // First, try to log in directly
        try {
          await googleLogin(res.data.email);
          navigate("/dashboard");
        } catch (loginErr) {
          // If login fails, try to register first
          await authService.register({
            first_name: res.data.given_name || "",
            last_name: res.data.family_name || "",
            email: res.data.email,
            phone: "",
            role: "superadmin",
          });
          // Then log in
          await googleLogin(res.data.email);
          navigate("/dashboard");
        }
      } else {
        throw new Error("Could not retrieve email from Google");
      }
    } catch (err) {
      setError(err.message || "Google Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

          <div className="flex justify-center w-full">
            <MicrosoftAuthButton text="Sign up with Microsoft" isRegister={true} />
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
