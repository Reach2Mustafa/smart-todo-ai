"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEnd, Headset, Loader2 } from "lucide-react";
import SendOtpApi from "@/apis/SendOtpApi";
import toast from "react-hot-toast";
import sendResetpasswordLink from "@/apis/sendResetpasswordLink";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendResetLink = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await sendResetpasswordLink({ email });

      if (result?.message) {
        toast.success(result.message); // success toast from API
        setMessage(result.message); // optional display message below button
      } else if (result?.error) {
        toast.error(result.error); // if error came from API
        setMessage(result.error);
      } else {
        toast.error("Something went wrong. Please try again.");
        setMessage("Something went wrong. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
      setMessage("Network error. Please try again.");
      console.error("handleSendResetLink error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh w-full lg:grid-cols-7">
      <div className="flex col-span-3 flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            SmartList
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <form
              onSubmit={handleSendResetLink}
              className={cn("flex flex-col gap-6")}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Forgot your password?</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                {message && (
                  <p className="text-sm text-center text-muted-foreground">
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="relative col-span-4 hidden bg-muted lg:block">
        <img
          src="/images/thumbnail.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default ForgotPassword;
