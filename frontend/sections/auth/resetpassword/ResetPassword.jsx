"use client"

import { use, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GalleryVerticalEnd, Headset, Eye, EyeOff, Loader2 } from "lucide-react"
import ResetPasswordApi from "@/api/ResetPasswordApi"
import toast from "react-hot-toast"

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const params = useSearchParams()
    const router = useRouter()

    const token = params.get("token")
    const email = params.get("email")
useEffect(() => {
        if (!token || !email) {
            toast.error("Invalid or missing token/email")
            router.push("/auth/login")
        }
    }, [token, email, router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in all fields")
            return
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long")
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        try {
            setLoading(true)
            const res = await ResetPasswordApi({ newPassword, token, email })
 if (res.error) {
        toast.error("Session expired please try again");
        return;
      }
            if (res) {
                toast.success("Password reset successful! Redirecting to login page.")
 router.push("/auth/login")
                
            } else {
                toast.error("Failed to reset password")
            }
        } catch (err) {
            console.error("Reset error:", err)
        } finally {
            setLoading(false)
        }
    }

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
                                <h1 className="text-2xl font-bold">Reset your password</h1>
                                <p className="text-sm text-muted-foreground">
                                    Enter your new password below.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {/* New Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="pr-10"
                                        />
                                        <div
                                            className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="pr-10"
                                        />
                                        <div
                                            className="absolute inset-y-0 right-2 flex items-center cursor-pointer"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <Eye className="w-4 h-4 text-muted-foreground" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-center text-muted-foreground">
                                        Password must be at least 6 characters long.
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                      
                                    {loading ?  <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
                                </Button>

                               
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
    )
}

export default ResetPassword
