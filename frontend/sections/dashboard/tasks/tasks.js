"use client";

import React, { useState, useEffect, useCallback } from "react";
import TaskCard from "./taskCard";
import getUserTasks from "@/apis/getUserTasks";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Search } from "lucide-react";

const Tasks = () => {
  const [userTasks, setUserTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter state
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Temporary filter state for dialog
  const [tempCategoryFilter, setTempCategoryFilter] = useState([]);
  const [tempStatusFilter, setTempStatusFilter] = useState([]);
  const [tempPriorityFilter, setTempPriorityFilter] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getUserTasks();
        if (data && !data.error) {
          setUserTasks(data);
          setFilteredTasks(data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Apply filters
  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = userTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(lowerSearch) ||
        task.description.toLowerCase().includes(lowerSearch);
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(task.category);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(task.status);
      const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(getPriorityRange(task.priority));
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
    });

    setFilteredTasks(filtered);
  }, [searchText, categoryFilter, statusFilter, priorityFilter, userTasks]);

  // Helper function to get priority range for filtering
  const getPriorityRange = (priority) => {
    const priorityNum = parseInt(priority);
    if (priorityNum >= 9) return "Critical";
    if (priorityNum >= 7) return "High";
    if (priorityNum >= 5) return "Medium";
    if (priorityNum >= 3) return "Low";
    if (priorityNum >= 1) return "Very Low";
    return "No Priority";
  };

  // Handle task deletion
  const handleDelete = useCallback(async (taskToDelete) => {
    if (isUpdating) return; // Prevent concurrent operations
    
    setIsUpdating(true);
    
    try {
      // Optimistic update - remove from state immediately
      setUserTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
      
      // Here you would typically call your delete API
      // await deleteTask(taskToDelete.id);
      
      console.log("Task deleted:", taskToDelete);
    } catch (error) {
      console.error("Error deleting task:", error);
      // Revert the optimistic update on error
      setUserTasks(prevTasks => [...prevTasks, taskToDelete]);
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating]);

  // Handle task update/edit
  const handleUpdate = useCallback(async (updatedTask) => {
    if (isUpdating) return; // Prevent concurrent operations
    
    setIsUpdating(true);
    
    try {
      const originalTask = userTasks.find(task => task.id === updatedTask.id);
      // Store the original task for potential rollback
      
      // Optimistic update - update in state immediately
      setUserTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? { ...task, ...updatedTask } : task
        )
      );
      
      // Here you would typically call your update API
      // await updateTask(updatedTask.id, updatedTask);
      
      console.log("Task updated:", updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      // Revert the optimistic update on error
      const originalTask = userTasks.find(task => task.id === updatedTask.id);
      if (originalTask) {
        setUserTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? originalTask : task
          )
        );
      }
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, userTasks]);

  // Open filter dialog and set temp values
  const openFilterDialog = () => {
    setTempCategoryFilter([...categoryFilter]);
    setTempStatusFilter([...statusFilter]);
    setTempPriorityFilter([...priorityFilter]);
    setFilterDialogOpen(true);
  };

  // Apply filters from dialog
  const applyFilters = () => {
    setCategoryFilter([...tempCategoryFilter]);
    setStatusFilter([...tempStatusFilter]);
    setPriorityFilter([...tempPriorityFilter]);
    setFilterDialogOpen(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchText("");
    setCategoryFilter([]);
    setStatusFilter([]);
    setPriorityFilter([]);
    setTempCategoryFilter([]);
    setTempStatusFilter([]);
    setTempPriorityFilter([]);
  };

  // Clear temp filters in dialog
  const clearTempFilters = () => {
    setTempCategoryFilter([]);
    setTempStatusFilter([]);
    setTempPriorityFilter([]);
  };

  // Toggle filter selection for temp filters
  const toggleTempCategoryFilter = (category) => {
    setTempCategoryFilter(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTempStatusFilter = (status) => {
    setTempStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const toggleTempPriorityFilter = (priority) => {
    setTempPriorityFilter(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  // Toggle filter selection for active filters
  const toggleCategoryFilter = (category) => {
    setCategoryFilter(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleStatusFilter = (status) => {
    setStatusFilter(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority) => {
    setPriorityFilter(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  // Check if any filters are active
  const hasActiveFilters = searchText || categoryFilter.length > 0 || statusFilter.length > 0 || priorityFilter.length > 0;

  // Get unique values for filter options
  const categories = [...new Set(userTasks.map((task) => task.category))];
  const statuses = [...new Set(userTasks.map((task) => task.status))];
  // Define priority ranges in specific order
  const priorityRanges = [
    "Critical",
    "High",
    "Medium",
    "Low",
    "Very Low"
  ].filter(range => userTasks.some(task => getPriorityRange(task.priority) === range));

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className=" flex justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={openFilterDialog}
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          Filter Tasks
          {(categoryFilter.length > 0 || statusFilter.length > 0 || priorityFilter.length > 0) && (
            <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
              {categoryFilter.length + statusFilter.length + priorityFilter.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Button and Active Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
        </div>
        <div className="mb-4 flex justify-between">
          <div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {searchText && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{searchText}"
                  <button
                    onClick={() => setSearchText("")}
                    className="hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {categoryFilter.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1 bg-green-100 text-green-800">
                  {category}
                  <button
                    onClick={() => toggleCategoryFilter(category)}
                    className="hover:bg-green-300 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {statusFilter.map((status) => (
                <Badge key={status} variant="secondary" className="gap-1 bg-blue-100 text-blue-800">
                  {status}
                  <button
                    onClick={() => toggleStatusFilter(status)}
                    className="hover:bg-blue-300 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
              {priorityFilter.map((priority) => (
                <Badge key={priority} variant="secondary" className="gap-1 bg-orange-100 text-orange-800">
                  {priority}
                  <button
                    onClick={() => togglePriorityFilter(priority)}
                    className="hover:bg-orange-300 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          </div>
          <p className=" text-[0.8rem]">
            Showing {filteredTasks.length} of {userTasks.length} tasks
          </p>
        </div>
      </div>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter size={20} />
              Filter Tasks
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-md font-medium text-gray-700">
                  Categories
                </label>
                {tempCategoryFilter.length > 0 && (
                  <Badge
                    onClick={() => setTempCategoryFilter([])}
                    className={" cursor-pointer rounded-full bg-black text-white text-[0.75rem] leading-none py-1  hover:bg-gray-800"}
                  >
                    Clear
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`temp-category-${category}`}
                      checked={tempCategoryFilter.includes(category)}
                      onCheckedChange={() => toggleTempCategoryFilter(category)}
                    />
                    <label
                      htmlFor={`temp-category-${category}`}
                      className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-md font-medium text-gray-700">
                  Status
                </label>
                {tempStatusFilter.length > 0 && (
                  <Badge
                    onClick={() => setTempStatusFilter([])}
                    className={" cursor-pointer rounded-full bg-black text-white text-[0.75rem] leading-none py-1  hover:bg-gray-800"}
                  >
                    Clear
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {statuses.map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`temp-status-${status}`}
                      checked={tempStatusFilter.includes(status)}
                      onCheckedChange={() => toggleTempStatusFilter(status)}
                    />
                    <label
                      htmlFor={`temp-status-${status}`}
                      className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-md font-medium text-gray-700">
                  Priority
                </label>
                {tempPriorityFilter.length > 0 && (
                  <Badge
                    onClick={() => setTempPriorityFilter([])}
                    className={" cursor-pointer rounded-full bg-black text-white text-[0.75rem] leading-none py-1  hover:bg-gray-800"}
                  >
                    Clear
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {priorityRanges.map((range) => (
                  <div key={range} className="flex items-center space-x-2">
                    <Checkbox
                      id={`temp-priority-${range}`}
                      checked={tempPriorityFilter.includes(range)}
                      onCheckedChange={() => toggleTempPriorityFilter(range)}
                    />
                    <label
                      htmlFor={`temp-priority-${range}`}
                      className="text-sm font-medium capitalize leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {range}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className=" grid grid-cols-2 gap-2">
            <Button
              className={"w-full h-10"}
              variant="outline"
              onClick={clearTempFilters}
            >
              Clear All
            </Button>

            <Button
              className={"w-full  h-10"}
              onClick={applyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                disabled={isUpdating}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more tasks."
                  : "You don't have any tasks yet."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tasks;