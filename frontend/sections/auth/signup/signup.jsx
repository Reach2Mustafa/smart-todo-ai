"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, GalleryVerticalEnd, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useUser } from "@/redux/userContext";
import UserSignupApi from "@/apis/UserSignupApi"; // You'll implement this

const Signup = () => {
  const router = useRouter();
  const { dispatch } = useUser();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullname || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await UserSignupApi({ name:fullname, email, password });
      console.log("Signup response:", res);

      if (res?.error) {
        toast.error(res.error);
        setError(res.error);
        return;
      }

      dispatch({ type: "SET_USER", payload: res });
      toast.success("Signup successful!");
      
    } catch (err) {
      setError("Something went wrong during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh w-full lg:grid-cols-7">
      {/* Left side form */}
      <div className="flex col-span-3 flex-col gap-4 p-6 md:p-10">
         <div className="flex absolute justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            SmartList
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <form onSubmit={handleSignup} className={cn("flex flex-col gap-6")}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your details to get started
                </p>
              </div>

              <div className="grid gap-6">
                
                <div className="grid gap-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="John Doe"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="Create a strong password"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <div
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                    >
                      {showPassword ? (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center -mt-3">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                     
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <div className=" text-center text-sm">
                    <p className="text-primary-grey">
                      Already have an account?{" "}
                      <Link
                        href="/auth/login"
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side image */}
      <div className="relative col-span-4 hidden bg-muted lg:block">
        <img
          src="/images/thumbnail.png"
          alt="Sign up image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default Signup;
