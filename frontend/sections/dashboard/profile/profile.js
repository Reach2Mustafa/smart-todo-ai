"use client";
import { Badge } from "@/components/ui/badge";
import { EditIcon, MailIcon, ToIcon } from "@/public/images/icons";
import { useUser } from "@/redux/userContext";
import { Check, ChevronRight, User, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheetprofile";
import { Button } from "@/components/ui/button";
import AddPersonalInfo from "./AddPersonalInfo";
import UpdateUserApi from "@/api/updateUserApi";
import { useSearchParams } from "next/navigation";
const Profile = () => {
    const [open, setOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("profile");
    const [updateProfile, setUpdateProfile] = useState(false);
    const [updateloading, setUpdateLoading] = useState(false);
    const params=useSearchParams()
   const edit = params.get("edit");

    const { state } = useUser();

    function orderWeeklySchedule(scheduleData) {
  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
    useEffect(()=>{
if(edit){
    setUpdateProfile(true)
}
    },[edit])
  const orderedSchedule = {};

  dayOrder.forEach((day) => {
    if (scheduleData.hasOwnProperty(day)) {
      orderedSchedule[day] = scheduleData[day];
    }
  });

  return orderedSchedule;
}
  const personalSectionRef = useRef(null);
    
    const user = state.user;

    // Dummy user data

    // Dummy schedule data
    // Dummy schedule data with multiple time slots per day
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || ''
    });
    const [scheduleData, setScheduleData] = useState(orderWeeklySchedule(user?.weekly_schedule));
    const profileRef = useRef(null);
    const scheduleRef = useRef(null);
    const scrollContainerRef = useRef(null);
  const handleUpdate = async () => {
    // Logic to handle update action
    if (personalSectionRef.current) {
      const data = await personalSectionRef.current.handleSubmit();

      
    }
  };
    useEffect(() => {
        setActiveSection("profile");
    }, []);
const onUpdate= async()=>{
    setUpdateLoading(true);
    await UpdateUserApi({weekly_schedule:scheduleData, full_name:formData.full_name});
    setUpdateProfile(!updateProfile);
    setUpdateLoading(false);
}
    useEffect(() => {
        const timer = setTimeout(() => {
            const getRootMargin = () => {
                if (typeof window !== "undefined") {
                    if (window.innerWidth < 768) {
                        return "-40% 0px -40% 0px";
                    } else {
                        return "-30% 0px -30% 0px";
                    }
                }
                return "-25% 0px -25% 0px";
            };

            const observer = new IntersectionObserver(
                (entries) => {
                    const intersectingEntries = entries.filter(
                        (entry) => entry.isIntersecting
                    );
                    if (intersectingEntries.length === 0) return;

                    intersectingEntries.sort((a, b) => {
                        const aRect = a.target.getBoundingClientRect();
                        const bRect = b.target.getBoundingClientRect();
                        return aRect.top - bRect.top;
                    });

                    const mostVisible = intersectingEntries[0];
                    const sectionId = mostVisible.target.getAttribute("data-section");

                    if (sectionId) {
                        setActiveSection(sectionId);
                    }
                },
                {
                    root: scrollContainerRef.current,
                    rootMargin: getRootMargin(),
                    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
                }
            );

            const sections = [profileRef, scheduleRef];
            sections.forEach((ref) => {
                if (ref.current) {
                    observer.observe(ref.current);
                }
            });

            return () => {
                sections.forEach((ref) => {
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                });
            };
        }, 300);

        return () => clearTimeout(timer);
    }, []);
    const timeToMinutes = (timeStr) => {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);

        if (period === "PM" && hours !== 12) {
            hours += 12;
        } else if (period === "AM" && hours === 12) {
            hours = 0; // Midnight (12 AM) is 0 hours
        }
        return hours * 60 + minutes;
    };

    // Helper function to calculate duration in hours
    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime || startTime === "Not Available") {
            return 0;
        }
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        const durationMinutes = endMinutes - startMinutes;
        return durationMinutes / 60; // Convert minutes to hours
    };

    const scrollToSection = (ref, id) => {
        setActiveSection(id);
        const container = scrollContainerRef.current;
        const section = ref.current;

        if (container && section) {
            const scrollOffset = section.offsetTop - 100;
            container.scrollTo({
                top: scrollOffset,
                behavior: "smooth",
            });
        }
    };

    const navItems = [
        { id: "profile", label: "Profile", ref: profileRef, icon: User },
        { id: "schedule", label: "Schedule", ref: scheduleRef, icon: Calendar },
    ];

    return (
        <section className="w-full h-full bg-white p-4">
            <Sheet open={updateProfile} onOpenChange={setUpdateProfile}>
                <SheetContent className="!max-w-[40rem] !w-full ">
                    <SheetHeader className={" px-4 py-2 border-b border-[#E6E8EC] "}>
                        <div className="  flex  justify-between items-center ">
                            <div className=" flex items-center">
                                <Button
                                    className="p-2 border rounded-xl mr-4"
                                    onClick={() => setUpdateProfile(!updateProfile)}
                                >
                                    <ChevronRight size={17} strokeWidth={2.5} />
                                </Button>

                                <SheetTitle className="text-black font-semibold  font-roboto flex items-center   leading-none">
                                    Update Profile
                                </SheetTitle>
                            </div>
                            <Button
                                onClick={() => handleUpdate()}
                                className="rounded-full  w-[100px] bg-purple-600 hover:bg-purple-700"
                            >
                              {updateloading?<Loader2 className=" animate-spin"/>:"Update"}  
                            </Button>
                        </div>
                    </SheetHeader>

                    <AddPersonalInfo
                        scheduleData={scheduleData}
                        setScheduleData={setScheduleData}
                        formData={formData}
                        setFormData={setFormData}
            ref={personalSectionRef}
            onUpdate={onUpdate}


                    />
                </SheetContent>
            </Sheet>
            <div className="flex gap-2 justify-start h-full w-full">
                <div className="grid sm:grid-cols-7 grid-cols-1 w-full gap-4">
                    <div
                        ref={scrollContainerRef}
                        className="h-[calc(100vh-90px)] col-span-5 relative bg-gray-50 overflow-y-auto pb-3 pt-0 border border-gray-200 rounded-3xl w-full"
                    >
                        {/* Navigation Bar */}
                        <div className="sticky top-0 z-50 bg-gray-50 border-b border-gray-200">
                            <div className="grid grid-cols-2 gap-4 w-full h-auto pt-3 px-2">
                                {navItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => scrollToSection(item.ref, item.id)}
                                        className={`w-full cursor-pointer transition-colors duration-300 flex flex-col items-center justify-center md:block md:text-center relative ${activeSection === item.id
                                                ? "text-black"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <item.icon className="block md:hidden mb-3 h-5 w-5" />
                                        <span className="hidden font-medium mb-3 md:block">
                                            {item.label}
                                        </span>
                                        {activeSection === item.id && (
                                            <div className="absolute bottom-0 left-0 h-[2px] bg-black w-full" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Container */}
                        <div className="pt-4 px-4 h-full">
                            {/* Profile Section */}
                            <div
                                ref={profileRef}
                                data-section="profile"
                                className="border-gray-200 pb-6 "
                            >
                                <div className="flex items-center justify-between">
                                    <h1 className="font-medium text-3xl text-black">
                                        {formData?.full_name}
                                    </h1>
                                    <div
                                        onClick={() => {
                                            setUpdateProfile(!updateProfile);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <EditIcon className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="pt-5 flex w-full flex-wrap gap-2">
                                    <div className="flex cursor-pointer items-center gap-2 rounded-xl bg-gray-100 px-3 py-2">
                                        <MailIcon className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium">{formData?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Section */}
                            <div
                                ref={scheduleRef}
                                data-section="schedule"
                                className="pt-6 border-t border-gray-200"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="font-medium font-helvetica text-xl text-black">
                                        Weekly Schedule
                                    </h1>
                                </div>
                                <div className=" ">
                                    <div className="relative">
                                        {/* Timeline line */}
                                        <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-purple-500 to-purple-300"></div>

                                        {Object.entries(scheduleData)
                                            .filter(
                                                ([day, timeSlots]) =>
                                                    timeSlots.some((slot) => slot.available) // Keep only days with at least one available slot
                                            )
                                            .map(([day, timeSlots], index) => {
                                                const totalAvailableHours = timeSlots.reduce(
                                                    (acc, slot) => {
                                                        if (
                                                            slot.available &&
                                                            slot.startTime &&
                                                            slot.endTime
                                                        ) {
                                                            return (
                                                                acc +
                                                                calculateDuration(slot.startTime, slot.endTime)
                                                            );
                                                        }
                                                        return acc;
                                                    },
                                                    0
                                                );

                                                return (
                                                    <div
                                                        key={index}
                                                        className="relative w-full flex items-start"
                                                    >
                                                        <div className="relative z-10 flex-shrink-0">
                                                            <div className="w-[16px] h-[16px] bg-white border-[3px] border-purple-500 rounded-full"></div>
                                                        </div>

                                                        <div className="ml-5 pb-8 w-full">
                                                            <div className="flex items-center justify-between w-full">
                                                                <h2 className="text-lg gap-2 flex font-medium text-black leading-none pb-2">
                                                                    {day}
                                                                </h2>
                                                            </div>

                                                            {/* Time slots for the day */}
                                                            <div className="space-y-2">
                                                                {timeSlots.map((slot, slotIndex) => (
                                                                    <div
                                                                        key={slotIndex}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        {slot.available ? (
                                                                            <>
                                                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                                                    <span className="font-medium">
                                                                                        {slot.startTime}
                                                                                    </span>
                                                                                    {slot.endTime && (
                                                                                        <>
                                                                                            <ToIcon />
                                                                                            <span className="font-medium">
                                                                                                {slot.endTime}
                                                                                            </span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            // This block will now only show if a day *has* available slots but this specific slot isn't available.
                                                                            // If you only want to show available slots for available days, you can remove this `else` branch.
                                                                            <>
                                                                                <span className="text-sm text-red-600 font-medium">
                                                                                    {slot.startTime}
                                                                                </span>
                                                                                <div className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                                                                    Unavailable
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {totalAvailableHours > 0 && (
                                                                <Badge
                                                                    className={
                                                                        " rounded-3xl cursor-pointer  mt-2"
                                                                    }
                                                                >
                                                                    {totalAvailableHours > 0
                                                                        ? `${totalAvailableHours.toFixed(
                                                                            1
                                                                        )} hour(s) available`
                                                                        : "Not Available"}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        {/* Optional: Message if no days are available */}

                                    </div>
                                    {Object.values(scheduleData).every(
                                        (slots) => !slots.some((slot) => slot.available)
                                    ) && (
                                            <Button onClick={()=>{setUpdateProfile(true)}} className="text-center w-full  h-10">
                                              Add Schedule
                                            </Button>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;
