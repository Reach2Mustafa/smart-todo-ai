import React, { useState, useEffect ,useImperativeHandle, forwardRef} from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Clock,
  Plus,
  X,
  Calendar,
  ChevronUp,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import toast from 'react-hot-toast';

const AddPersonalInfo =  forwardRef((props, ref) => {
  const { onUpdate, formData, setFormData, scheduleData, setScheduleData } = props;
  const [errors, setErrors] = useState({});
  const [scheduleErrors, setScheduleErrors] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Generate 12-hour time options
  const generateTimeOptions = () => {
    const times = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i === 0 ? 12 : i > 12 ? i - 12 : i;
        const ampm = i < 12 ? 'AM' : 'PM';
        const minute = j === 0 ? '00' : j.toString();
        times.push(`${hour}:${minute} ${ampm}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Convert 12-hour format to minutes for comparison
  const timeToMinutes = (time12h) => {
    if (!time12h || time12h === "Not Available") return 0;
    
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    
    if (modifier === 'AM' && hours === 12) hours = 0;
    if (modifier === 'PM' && hours !== 12) hours += 12;
    
    return hours * 60 + minutes;
  };

  // Convert minutes back to 12-hour format
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? 'AM' : 'PM';
    return `${hour12}:${mins.toString().padStart(2, '0')} ${ampm}`;
  };

  // Check if two time slots overlap
  const timeSlotsOverlap = (slot1, slot2) => {
    const start1 = timeToMinutes(slot1.startTime);
    const end1 = timeToMinutes(slot1.endTime);
    const start2 = timeToMinutes(slot2.startTime);
    const end2 = timeToMinutes(slot2.endTime);
    
    return (start1 < end2 && end1 > start2);
  };

  // Find the next available time slot that doesn't overlap
  const findNextAvailableSlot = (day) => {
    const existingSlots = scheduleData[day]
      .filter(slot => slot.available)
      .map(slot => ({
        start: timeToMinutes(slot.startTime),
        end: timeToMinutes(slot.endTime)
      }))
      .sort((a, b) => a.start - b.start);

    // Default slot duration: 8 hours (480 minutes)
    const defaultDuration = 480;
    let proposedStart = 9 * 60; // 9:00 AM in minutes
    let proposedEnd = proposedStart + defaultDuration;

    // Check if default slot overlaps with existing slots
    for (const existing of existingSlots) {
      if (proposedStart < existing.end && proposedEnd > existing.start) {
        // If there's an overlap, try to place the slot after the existing one
        proposedStart = existing.end;
        proposedEnd = proposedStart + defaultDuration;
        
        // If the new slot would go past midnight, try a shorter duration
        if (proposedEnd > 24 * 60) {
          proposedEnd = 24 * 60;
          if (proposedStart >= proposedEnd) {
            // If we can't fit any slot, try a 1-hour slot
            proposedStart = existing.end;
            proposedEnd = Math.min(proposedStart + 60, 24 * 60);
          }
        }
      }
    }

    // If we still can't fit, try to find a gap between existing slots
    if (proposedEnd > 24 * 60 || existingSlots.some(slot => 
      proposedStart < slot.end && proposedEnd > slot.start
    )) {
      // Find the largest gap between slots
      let bestGap = null;
      let bestGapSize = 0;

      for (let i = 0; i < existingSlots.length - 1; i++) {
        const gapStart = existingSlots[i].end;
        const gapEnd = existingSlots[i + 1].start;
        const gapSize = gapEnd - gapStart;

        if (gapSize > bestGapSize && gapSize >= 60) { // At least 1 hour gap
          bestGap = { start: gapStart, end: gapEnd };
          bestGapSize = gapSize;
        }
      }

      if (bestGap) {
        proposedStart = bestGap.start;
        proposedEnd = Math.min(bestGap.start + Math.min(defaultDuration, bestGapSize), bestGap.end);
      } else {
        // If no gap found, try early morning
        proposedStart = 6 * 60; // 6:00 AM
        proposedEnd = Math.min(proposedStart + 60, existingSlots[0]?.start || 24 * 60);
      }
    }

    return {
      startTime: minutesToTime(proposedStart),
      endTime: minutesToTime(proposedEnd)
    };
  };

  // Validate individual time slot
  const validateTimeSlot = (day, index, slot) => {
    const errors = [];
    
    if (!slot.available) return errors;
    
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    
    // Check if start time is before end time
    if (startMinutes >= endMinutes) {
      errors.push('Start time must be before end time');
    }
    
    // Check for overlaps with other slots on the same day
    const daySlots = scheduleData[day] || [];
    for (let i = 0; i < daySlots.length; i++) {
      if (i !== index && daySlots[i].available) {
        if (timeSlotsOverlap(slot, daySlots[i])) {
          errors.push('Time slot overlaps with another slot');
          break;
        }
      }
    }
    
    return errors;
  };

  // Validate entire schedule
  const validateSchedule = () => {
    const newScheduleErrors = {};
    let hasErrors = false;
    
    Object.entries(scheduleData).forEach(([day, timeSlots]) => {
      timeSlots.forEach((slot, index) => {
        if (slot.available) {
          const slotErrors = validateTimeSlot(day, index, slot);
          if (slotErrors.length > 0) {
            if (!newScheduleErrors[day]) newScheduleErrors[day] = {};
            newScheduleErrors[day][index] = slotErrors;
            hasErrors = true;
          }
        }
      });
    });
    
    setScheduleErrors(newScheduleErrors);
    return !hasErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
 
    
    const isFormValid = validateForm();
    const isScheduleValid = validateSchedule();
    
    if (isFormValid && isScheduleValid) {
      // Check if at least one day has available slots
      const hasAvailableSlots = Object.values(scheduleData).some(slots => 
        slots.some(slot => slot.available)
      );
      
      if (!hasAvailableSlots) {
        toast.error('Please add at least one available time slot to your schedule.');
        return;
      }
      
      if (onUpdate) {
        onUpdate({ ...formData, schedule: scheduleData });
      }
    }
  };
  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));
  const addTimeSlot = (day) => {
    const newSlot = findNextAvailableSlot(day);
    
    setScheduleData(prev => ({
      ...prev,
      [day]: [
        ...prev[day].filter(slot => slot.startTime !== "Not Available"),
        { ...newSlot, available: true }
      ]
    }));
  };

  const removeTimeSlot = (day, index) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: prev[day].length > 1 
        ? prev[day].filter((_, i) => i !== index)
        : [{ startTime: "Not Available", endTime: "", available: false }]
    }));
    
    // Clear errors for this slot
    setScheduleErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[day] && newErrors[day][index]) {
        delete newErrors[day][index];
        if (Object.keys(newErrors[day]).length === 0) {
          delete newErrors[day];
        }
      }
      return newErrors;
    });
  };

  const updateTimeSlot = (day, index, field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
    
    // Clear errors for this slot when user makes changes
    setScheduleErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[day] && newErrors[day][index]) {
        delete newErrors[day][index];
        if (Object.keys(newErrors[day]).length === 0) {
          delete newErrors[day];
        }
      }
      return newErrors;
    });
  };

  const makeAvailable = (day) => {
    const newSlot = findNextAvailableSlot(day);
    
    setScheduleData(prev => ({
      ...prev,
      [day]: [{ ...newSlot, available: true }]
    }));
  };

  const makeUnavailable = (day) => {
    setScheduleData(prev => ({
      ...prev,
      [day]: [{ startTime: "Not Available", endTime: "", available: false }]
    }));
    
    // Clear errors for this day
    setScheduleErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors[day]) {
        delete newErrors[day];
      }
      return newErrors;
    });
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex flex-col gap-4 pb-12">
        {/* Personal Information */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Personal Information</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              placeholder="Enter your email address"
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500">Email cannot be changed</p>
          </div>
        </div>

        {/* Schedule Management */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Weekly Schedule</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            {Object.entries(scheduleData).map(([day, timeSlots]) => (
              <div key={day} className="border rounded-lg p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-lg">{day}</h3>
                  <div className="flex items-center gap-2">
                    {timeSlots.some(slot => slot.available) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeSlot(day)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2">
                        {slot.available ? (
                          <>
                            <div className="flex w-full items-center gap-2">
                              <Select
                                value={slot.startTime}
                                onValueChange={(value) => updateTimeSlot(day, index, 'startTime', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Start time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              
                              <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              
                              <Select
                                value={slot.endTime}
                                onValueChange={(value) => updateTimeSlot(day, index, 'endTime', value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="End time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {timeOptions.map(time => (
                                    <SelectItem key={time} value={time}>
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTimeSlot(day, index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => makeAvailable(day)}
                              className="h-10 w-full px-3"
                            >
                              Add Schedule
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      {/* Display validation errors for this slot */}
                      {scheduleErrors[day] && scheduleErrors[day][index] && (
                        <div className="text-sm text-red-500 pl-2">
                          {scheduleErrors[day][index].map((error, errorIndex) => (
                            <p key={errorIndex}>{error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

    
      </div>
    </div>
  );
}
)
export default AddPersonalInfo;