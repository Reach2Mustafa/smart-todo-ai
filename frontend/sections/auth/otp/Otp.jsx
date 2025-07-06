"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/redux/userContext";
import SendOtpApi from "@/apis/SendOtpApi";
import toast from "react-hot-toast";
import VerifyOtpApi from "@/apis/verifyOtp";
// import { useRouter } from "next/router";

const OTP = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const { state } = useUser();
    const [loading, setLoading] = useState(false)

    // const router = useRouter();
  
  const { user } = state;

  const [resendTimer, setResendTimer] = useState(0);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const isInitialMount = useRef(true);
  const otpSentRef = useRef(false); // ✅ Use ref to prevent double calls

  const sendOtp = async () => {
    if (!user?.email || otpSentRef.current) return;
    
    otpSentRef.current = true; // ✅ Set flag immediately
    
    try {
      await SendOtpApi({ email: user.email });
      toast.success("OTP sent to your email!");
      setResendTimer(30);
      setHasSentOtp(true);
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
      console.error("SendOtpApi error:", error);
      otpSentRef.current = false; // ✅ Reset on error
    }
  };

  // ✅ Only send OTP once when component mounts and user is available
  useEffect(() => {
    if (user?.email && isInitialMount.current) {
      isInitialMount.current = false;
      sendOtp();
    }
  }, [user?.email]); // Only depend on user email

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    pasted.forEach((char, i) => {
      if (/^\d$/.test(char) && i < 6) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const finalOtp = otp.join("");
  const isValidOtp = finalOtp.length === 6 && /^\d{6}$/.test(finalOtp);

  if (!isValidOtp) {
    toast.error("Invalid OTP. Please enter a valid 6-digit OTP.");
    return;
  }

  setLoading(true); // Set loading state
  try {
    const result = await VerifyOtpApi({ otp: Number(finalOtp)  });

    if (result?.message) {
      toast.success(result.message);
     window.location.reload(); // Reload to fetch user data
    } else if (result?.error) {
      toast.error(result.error); // <--- this should now show "Invalid OTP."
    } else {
      toast.error("An unexpected error occurred.");
    }
  } catch (err) {
    console.error("OTP Submit Error:", err);
    toast.error("Verification failed. Please try again.");
  }
setLoading(false); // Reset loading state
  console.log("OTP Submitted:", finalOtp);
};


  // ✅ Manual resend function that resets the flags
  const handleResend = async () => {
    otpSentRef.current = false; // Reset ref flag
    setHasSentOtp(false); // Reset state flag
    await sendOtp();
  };

  return (
    <div className="grid min-h-svh w-full lg:grid-cols-7">
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
            <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6")}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Enter OTP</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  We've sent a 6-digit OTP to your {user.email}.
                </p>
              </div>

              <div className="grid gap-6">
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-11 text-center text-lg"
                      required
                    />
                  ))}
                </div>
                 <Button type="submit" className="w-full" disabled={loading}>
                      
                                    {loading ?  <Loader2 className="h-4 w-4 animate-spin" /> : " Verify OTP"}
                                </Button>




                <div className="text-sm text-center text-muted-foreground">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    className="underline hover:text-primary disabled:opacity-50"
                    onClick={handleResend}
                    disabled={resendTimer > 0}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                  </button>
                </div>
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

export default OTP;