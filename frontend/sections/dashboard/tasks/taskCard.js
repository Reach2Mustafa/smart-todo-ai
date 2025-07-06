import React, { useEffect, useState } from "react";
import { EllipsisVertical, Check, Trash2, Clock, Flag, Edit, Save, X, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheetprofile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import deleteTask from "@/apis/deleteTask";
import updateTask from "@/apis/updateTask";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSearchParams } from "next/navigation";
const getPriorityColor = (priority) => {
    const priorityNum = parseInt(priority);
    if (priorityNum >= 9) {
        return "bg-red-100 text-red-700 border-red-200";
    } else if (priorityNum >= 7) {
        return "bg-orange-100 text-orange-700 border-orange-200";
    } else if (priorityNum >= 5) {
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    } else if (priorityNum >= 3) {
        return "bg-blue-100 text-blue-700 border-blue-200";
    } else if (priorityNum >= 1) {
        return "bg-green-100 text-green-700 border-green-200";
    } else {
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

const getPriorityLabel = (priority) => {
    const priorityNum = parseInt(priority);
    if (priorityNum >= 9) {
        return "Critical";
    } else if (priorityNum >= 7) {
        return "High";
    } else if (priorityNum >= 5) {
        return "Medium";
    } else if (priorityNum >= 3) {
        return "Low";
    } else if (priorityNum >= 1) {
        return "Very Low";
    } else {
        return "No Priority";
    }
};

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case "completed":
            return "bg-green-100 text-green-700 border-green-200";
        case "in progress":
            return "bg-blue-100 text-blue-700 border-blue-200";
        case "pending":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";
        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
export default function TaskCard({ task,onDelete ,onUpdate}) {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [updateloading, setUpdateLoading] = useState(false);
     const searchParams = useSearchParams();
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
 const [isHighlighted, setIsHighlighted] = useState(false);
 const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };
 useEffect(() => {
        const ids = searchParams.get('ids');
        if (ids) {
            const idArray = ids.split(',');
            const taskIdString = task.id.toString();
            setIsHighlighted(idArray.includes(taskIdString));
        } else {
            setIsHighlighted(false);
        }
    }, [searchParams, task.id]);
    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        try {
            const res = await deleteTask(task.id);
            if (res.message) {
                onDelete(task)
                toast.success("Task deleted successfully!");
                // Reload the window after successful deletion
              
            } else {
                toast.error(res.error || "Delete failed");
            }
        } catch (error) {
            toast.error("Something went wrong while deleting.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteDialog(false);
    };
    const [editedTask, setEditedTask] = useState({
        title: task.title || '',
        description: task.description || '',
        enhanced_description: task.enhanced_description || '',
        category: task.category || '',
        priority: task.priority || '1',
        status: task.status || 'pending',
        deadline: task.deadline || ''
    });


    const handleCancel = () => {
        setEditedTask({
            title: task.title || '',
            description: task.description || '',
            enhanced_description: task.enhanced_description || '',
            category: task.category || '',
            priority: task.priority || '1',
            status: task.status || 'pending',
            deadline: task.deadline || ''
        });
        setIsSheetOpen(false);
    };


    const isCompleted = task.status === "completed";
    const isOverdue = new Date(task.deadline) < new Date() && !isCompleted;


    const handleEdit = () => {
        setIsSheetOpen(true);
    };
    

    const handleSave = async () => {
        if (!editedTask.title.trim()) {
            toast.error("Title is required.");
            return;
        }

        if (!editedTask.category.trim()) {
            toast.error("Category is required.");
            return;
        }

        setUpdateLoading(true);
        try {
            const res = await updateTask(task.id, editedTask);
            if (res.message) {
                toast.success("Task updated successfully!");
                onUpdate(editedTask)
                setIsSheetOpen(false);
            } else {
                toast.error("Update failed");
            }
        } catch (error) {
            toast.error("Something went wrong while updating.");
        } finally {
            setUpdateLoading(false);
        }
    };





    return (
        <>
         <div className={`bg-white rounded-xl p-5 space-y-4 border transition-all duration-200 hover:shadow-lg
    ${isCompleted
        ? "border-green-200 bg-green-50/30"
        : isOverdue
            ? "border-red-200 bg-red-50/30"
            : "border-gray-200 hover:border-gray-300"
    }
    ${isHighlighted ? "ring-2 ring-blue-500/60 bg-blue-50/20" : ""}
`}>

                {/* Header */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <h2 className={`text-lg font-semibold leading-tight ${isCompleted ? "text-gray-500 line-through" : "text-gray-800"
                            }`}>
                            {editedTask.title}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(editedTask.status)}`}>
                            {editedTask.status}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <EllipsisVertical size={16} className="text-gray-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                                <DropdownMenuItem
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                                >
                                    <Edit size={16} className="text-blue-600" />
                                    Edit Task
                                </DropdownMenuItem>



                                <DropdownMenuItem
                                    onClick={handleDeleteClick}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <p className={`text-gray-600 leading-relaxed ${isCompleted ? "line-through opacity-70" : ""
                        }`}>
                        {editedTask.description}
                    </p>
                    {editedTask.enhanced_description && (
                        <p className={`text-sm italic text-gray-500 ${isCompleted ? "line-through opacity-70" : ""
                            }`}>
                            {editedTask.enhanced_description}
                        </p>
                    )}
                </div>

                {/* Tags and Info */}
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        {editedTask.category}
                    </span>

                    <span className={`px-3 py-1 rounded-full border flex items-center gap-1 ${getPriorityColor(editedTask.priority)}`}>
                        <Flag size={12} />
                        {getPriorityLabel(editedTask.priority)}
                    </span>

                    <span className={`px-3 py-1 rounded-full border flex items-center gap-1 ${isOverdue
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}>
                        <Clock size={12} />
                        {formatDate(editedTask.deadline)}
                        {isOverdue && <span className="text-xs font-medium">(Overdue)</span>}
                    </span>
                </div>

                {/* Progress indicator for completed tasks */}
                {isCompleted && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        <Check size={16} />
                        <span className="font-medium">Task completed!</span>
                    </div>
                )}
            </div>

          
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="!max-w-[40rem] !w-full ">
                    <SheetHeader className={" px-4 py-2 border-b border-[#E6E8EC] "}>
                        <div className="  flex  justify-between items-center ">
                            <div className=" flex items-center">
                                <Button
                                    className="p-2 border rounded-xl mr-4"
                                    onClick={() => handleCancel()}
                                >
                                    <ChevronRight size={17} strokeWidth={2.5} />
                                </Button>

                                <SheetTitle className="text-black font-semibold  font-roboto flex items-center   leading-none">
                                    Update Task
                                </SheetTitle>
                            </div>
                            <Button
                                onClick={handleSave}
                                className="rounded-full  w-[100px] bg-purple-600 hover:bg-purple-700"
                            >
                                {updateloading ? <Loader2 className=" animate-spin" /> : "Update"}
                            </Button>
                        </div>
                    </SheetHeader>

                    <div className="p-4 flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={editedTask.title}
                                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                placeholder="Enter task title"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editedTask.description}
                                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                placeholder="Enter task description"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="enhanced_description">Enhanced Description</Label>
                            <Textarea
                                id="enhanced_description"
                                value={editedTask.enhanced_description}
                                onChange={(e) => setEditedTask({ ...editedTask, enhanced_description: e.target.value })}
                                placeholder="Enter enhanced description"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={editedTask.category}
                                onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
                                placeholder="Enter category"
                            />
                        </div>
                        <div className="grid gap-2 md:gap-4 grid-cols-2">

                            <div className="space-y-2 w-full">
                                <Label htmlFor="status">Status</Label>
                                <Select value={editedTask.status} onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}>
                                    <SelectTrigger className={"w-full"}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 w-full">
                                <Label htmlFor="priority">Priority</Label>
                                <Select value={editedTask.priority} onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}>
                                    <SelectTrigger className={" w-full"}>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={1}>Very Low</SelectItem>
                                        <SelectItem value={2} className="hidden">Very Low</SelectItem>

                                        <SelectItem value={3}>Low</SelectItem>
                                        <SelectItem value={4} className="hidden">Low</SelectItem>

                                        <SelectItem value={5}>Medium</SelectItem>
                                        <SelectItem value={6} className="hidden">Medium</SelectItem>

                                        <SelectItem value={7}>High</SelectItem>
                                        <SelectItem value={8} className="hidden">High</SelectItem>

                                        <SelectItem value={9}>Critical</SelectItem>
                                        <SelectItem value={10} className="hidden">Critical</SelectItem>


                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1 w-full">
                            <Label htmlFor="deadline" className="text-sm font-medium text-gray-700">
                                Task Deadline
                            </Label>
                            <div className="w-full flex  justify-center">
                                <DatePicker
                                    id="deadline"
                                    selected={editedTask.deadline ? new Date(editedTask.deadline) : null}
                                    onChange={(date) => setEditedTask({ ...editedTask, deadline: date.toISOString() })}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="MMM d, yyyy h:mm aa"
                                    placeholderText="Select deadline"
                                    minDate={new Date()}
                                    className=" md:w-[610px] rounded-lg border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Choose a deadline with both date and time.</p>
                        </div>

                    </div>


                </SheetContent>
            </Sheet>
             {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-lg font-semibold text-gray-900">
                                    Delete Task
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-gray-600 mt-1">
                                    Do you really want to delete this task?
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-4">
                        <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    
                    <AlertDialogFooter className=" grid grid-cols-2 gap-2">
                        <AlertDialogCancel 
                            onClick={handleDeleteCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={deleteLoading}
                        >
                            Cancel
                        </AlertDialogCancel>
                      
                            <Button
                                onClick={handleDeleteConfirm}
                                disabled={deleteLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Task
                                    </>
                                )}
                            </Button>
                       
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}