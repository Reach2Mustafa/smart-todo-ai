"use client"
import { Calendar, Home, Inbox, Search, Settings, User, ChevronRight, MessageCircleQuestion, ChevronDown, LogOut, KeyRound, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useUser } from "@/redux/userContext"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import {motion} from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  LayoutDashboard,
  ListTodo,
  PlusSquare,
  User as Usersvg,
} from "lucide-react";

import { Button } from "./ui/button"
import { BorderBeam } from "./ui/border-beam"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import changePasswordAPI from "@/apis/changePasswordAPI"
import toast from "react-hot-toast"
import Link from "next/link"

const items = [
  {
    title: "Overview",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/dashboard/tasks",
    icon: ListTodo,
  },
  {
    title: "Add Task",
    url: "/dashboard/tasks/add-task",
    icon: PlusSquare,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: Usersvg,
  },
];

export function AppSidebar() {
    const { state, dispatch } = useUser();
    const router = useRouter();
    const [shouldShow, setShouldShow] = useState(false);
    const user = state.user;

    // Change password dialog state
    const [changePasswordOpen, setChangePasswordOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch({ type: "SET_USER", payload: null });
        router.push("/auth/login");
    };
    useEffect(() => {
    if (user?.weekly_schedule) {
      const hasAnyAvailableSlot = Object.values(user.weekly_schedule).some(daySlots =>
        daySlots.some(slot => slot.available === true)
      );
      setShouldShow(!hasAnyAvailableSlot);
      
      
    }
  }, [user]);


    const validatePasswords = () => {
        const newErrors = {};

        // Check if old password is provided
        if (!passwordData.oldPassword.trim()) {
            newErrors.oldPassword = "Current password is required";
        }

        // Check if new password is provided
        if (!passwordData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else {
            // Password strength validation
            if (passwordData.newPassword.length < 8) {
                newErrors.newPassword = "Password must be at least 8 characters long";
            }
        }

        // Check if confirm password matches
        if (!passwordData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Check if new password is different from old password
        if (passwordData.oldPassword && passwordData.newPassword && passwordData.oldPassword === passwordData.newPassword) {
            newErrors.newPassword = "New password must be different from current password";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleChangePassword = async () => {
        if (!validatePasswords()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Here you would typically call your change password API
            const response = await changePasswordAPI({
                old_password: passwordData.oldPassword,
                new_password: passwordData.newPassword
            });
            
           if(response.error){
            toast.error(response.error)
            return
           }
             toast.success("Password Changed Successfully");
           
            // Reset form and close dialog
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setChangePasswordOpen(false);
            
        } catch (error) {
            console.error("Error changing password:", error);
            
            // Handle specific error cases
            if (error.response?.status === 400) {
                setErrors({
                    oldPassword: "Current password is incorrect"
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to change password. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseDialog = () => {
        setChangePasswordOpen(false);
        setPasswordData({
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        setErrors({});
    };

    return (
        <>
          <Dialog open={shouldShow} onOpenChange={setShouldShow}>


      <DialogContent className="w-[95%] max-w-[95%] rounded-3xl md:max-w-[500px]  overflow-hidden border-0 outline-0 p-0">
        <div className="flex max-w-[100%]  py-4 md:py-8 px-4 md:px-8 justify-between items-center flex-col">
          <div className="w-full flex flex-col gap-4 text-center">
           <DialogTitle className="text-[1.5rem] md:text-4xl font-roboto font-semibold text-black text-center leading-tight">
  Complete Your Profile to Unlock Smart Planning
</DialogTitle>

<p className="text-sm mx-auto font-overusedGrotesktext-black/80 text-center max-w-lg leading-relaxed">
  You're just a step away! Add your availability and preferences so we can intelligently organize your tasks and optimize your daily productivity.
</p>
<Link href={"/dashboard/profile?edit=true"}>
 <Button style={{ outline: "none", boxShadow: "none" }}
            onClick={() => setShouldShow(!shouldShow)} className="font-medium w-max mx-auto outline-none ring-0 font-overusedGrotesktext-[15px] ">
            Start Now
          </Button>
</Link>
          </div>

          {/* Desktop View (grid layout) */}
         
         

         
        </div>
      </DialogContent>
    </Dialog>
            <Sidebar className="border-r">
                <SidebarHeader className="">
                    <div className="flex items-center gap-2 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Home className="h-4 w-4" />
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">SmartList</span>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="gap-0">
                    <SidebarGroup>
                        <SidebarGroupLabel className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Navigation
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1 px-2">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            size="lg"
                                            className="px-3 py-2 h-11 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                                        >
                                            <a href={item.url} className="flex items-center gap-3">
                                                <item.icon className="h-5 w-5 shrink-0" />
                                                <span className="flex-1">{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="border-t border-sidebar-border">
                    <SidebarMenu>
                        <SidebarMenuItem>
                           <DropdownMenu className="w-full">
                <DropdownMenuTrigger style={{ outline: "none" }} asChild>
                  <motion.div
                    className="w-full flex items-center gap-3 relative bg-white/50 backdrop-blur-sm hover:bg-white/60 transition-colors rounded-xl p-3 border cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                   
                      <BorderBeam
                        className={" bg-[#F1F1F1]  "}
                        size={70}
                        duration={7}
                        delay={9}
                      />
                
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullname} />
                      <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
                    </Avatar>

                    {user &&  (
                      <>
                        <div className="font-overusedGroteskflex-1 text-left">
                          <h1 className="font-medium text-sm truncate max-w-[180px] ">
                            {user?.fullname}
                          </h1>
                          <p className="text-primary-grey text-xs truncate">
                            {user?.email}
                          </p>
                        </div>
                        <ChevronDown className="hidden sm:block" size={18} />
                      </>
                    )}

                   
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className=" w-[17rem] sm:w-[19rem] rounded-xl"
                  align="end"
                  side="top"
                >
                  <DropdownMenuItem
                    onClick={() => setChangePasswordOpen(true)}
                    className="hover:bg-accent rounded-md px-4 cursor-pointer"
                  >
                    <KeyRound className="h-4 w-4 mr-2" />
                    Change Password
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className=" hover:text-red-600 text-red-600 rounded-md px-4"
                  >
                    <LogOut  className=" text-red-600 h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            {/* Change Password Dialog */}
            <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
                <DialogContent className="sm:max-w-[425px] p-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            Change Password
                        </DialogTitle>
                       
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="oldPassword">Current Password</Label>
                            <Input
                                id="oldPassword"
                                type="password"
                                placeholder="Enter current password"
                                value={passwordData.oldPassword}
                                onChange={(e) => handlePasswordChange("oldPassword", e.target.value)}
                                className={errors.oldPassword ? "border-red-500" : ""}
                            />
                            {errors.oldPassword && (
                                <p className="text-sm text-red-500">{errors.oldPassword}</p>
                            )}
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                className={errors.newPassword ? "border-red-500" : ""}
                            />
                            {errors.newPassword && (
                                <p className="text-sm text-red-500">{errors.newPassword}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Password must be at least 8 characters with uppercase, lowercase, and numbers
                            </p>
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                    
                    <DialogFooter className={"  grid grid-cols-2"}>
                        <Button
                            variant="outline"
                            onClick={handleCloseDialog}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleChangePassword}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <Loader2 className=" animate-spin"/>: "Change Password"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}