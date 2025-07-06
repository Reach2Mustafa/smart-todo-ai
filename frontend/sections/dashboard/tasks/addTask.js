"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Square, Edit3, FileText, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AddtaskApi from '@/api/AddtaskApi';

const AddTask = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form states
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    
    // Validation states
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    
    const recognitionRef = useRef(null);
    const textareaRef = useRef(null);
    const router = useRouter();

    const tabs = [
        { id: 'summary', name: 'Summary' },
        { id: 'messageOrEmail', name: 'Email/Message' },
        { id: 'addTask', name: 'Task' },
    ];

    // Validation functions
    const validateTaskForm = () => {
        const newErrors = {};
        
        if (!taskTitle.trim()) {
            newErrors.taskTitle = 'Task title is required';
        } else if (taskTitle.trim().length < 3) {
            newErrors.taskTitle = 'Task title must be at least 3 characters long';
        }
        
        if (!taskDescription.trim()) {
            newErrors.taskDescription = 'Task description is required';
        } else if (taskDescription.trim().length < 10) {
            newErrors.taskDescription = 'Task description must be at least 10 characters long';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateSummaryForm = () => {
        const newErrors = {};
        const content = activeTab === 'summary' ? transcript : emailMessage;
        
        if (!content.trim()) {
            newErrors.summary = activeTab === 'summary' 
                ? 'Summary content is required' 
                : 'Email/Message content is required';
        } else if (content.trim().length < 20) {
            newErrors.summary = 'Content must be at least 20 characters long';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFieldBlur = (fieldName) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    };

    const clearErrors = () => {
        setErrors({});
        setTouchedFields({});
    };

    useEffect(() => {
        // Clear errors when switching tabs
        clearErrors();
    }, [activeTab]);

    useEffect(() => {
        // Check if browser supports speech recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptText = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptText;
                    } else {
                        interimTranscript += transcriptText;
                    }
                }

                // Update final transcript by appending new final results
                if (finalTranscript) {
                    setTranscript(prev => {
                        // Add space before new content if transcript is not empty
                        if (prev.trim() !== '') {
                            return prev + ' ' + finalTranscript;
                        }
                        return prev + finalTranscript;
                    });
                }

                // Update interim transcript (this will replace previous interim)
                setInterimTranscript(interimTranscript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // Clear any remaining interim transcript when recognition ends
                setInterimTranscript('');
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                toast.error('Speech recognition failed. Please try again.');
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            setIsListening(true);
            setInterimTranscript(''); // Clear interim when starting
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            setInterimTranscript(''); // Clear interim when stopping
        }
    };

    const handleTextChange = (e) => {
        setTranscript(e.target.value);
        // Clear summary error when user starts typing
        if (errors.summary) {
            setErrors(prev => ({ ...prev, summary: '' }));
        }
    };

   const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
        let isValid = false;
        let requestData = {};

        if (activeTab === 'addTask') {
            // Validate single task form
            isValid = validateTaskForm();
            if (!isValid) {
                toast.error('Please fill in all required fields correctly');
                setIsLoading(false);
                return;
            }
            requestData = {
                task_type: 'single',
                task: {
                    title: taskTitle.trim(),
                    description: taskDescription.trim()
                }
            };
        } else {
            // Validate summary forms (summary and messageOrEmail)
            isValid = validateSummaryForm();
            if (!isValid) {
                toast.error('Please provide valid content to generate tasks');
                setIsLoading(false);
                return;
            }
            const content = activeTab === 'summary' ? transcript : emailMessage;
            requestData = {
                task_type: 'summary',
                summary: content.trim()
            };
        }

        const response = await AddtaskApi(requestData);
        
        if (response.success) {
            // Handle different response structures based on task type
            let tasks = [];
            let taskIds = [];
            
            if (activeTab === 'addTask') {
                // Single task: response.task contains the task data
                tasks = [response.task];
                taskIds = [response.task.id];
            } else {
                // Summary tasks: response.tasks contains array of tasks
                tasks = response.tasks || [];
                taskIds = tasks.map(task => task.id);
            }
            
            // Show success toast
            if (taskIds.length > 1) {
                toast.success(`Successfully created ${taskIds.length} tasks!`);
            } else {
                toast.success('Task created successfully!');
            }
            
            // Redirect to tasks page with IDs
            if (taskIds.length > 1) {
                router.push(`/dashboard/tasks?ids=${taskIds.join(',')}`);
            } else {
                router.push(`/dashboard/tasks?ids=${taskIds[0]}`);
            }
        } else {
            // Handle API error
            toast.error(response.error || 'Failed to create tasks. Please try again.');
        }
    } catch (error) {
        console.error('Error creating tasks:', error);
        toast.error('An unexpected error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
};

    const getButtonText = () => {
        if (isLoading) return 'Processing...';
        if (activeTab === 'addTask') return 'Create Task';
        return 'Generate Tasks';
    };

    const ErrorMessage = ({ message }) => (
        <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
            <AlertCircle size={14} />
            {message}
        </div>
    );

    return (
        <div className="w-full h-full px-4 bg-white flex flex-col overflow-hidden">
            {/* Fixed Header with Tabs */}
            <div className="flex flex-row gap-4 sticky top-0 bg-white w-full flex-shrink-0 pt-2">
                {tabs.map((tab) => (
                    <motion.button
                        key={tab.id}
                        className={`relative py-3 px-4 text-md font-medium rounded-t-lg transition-colors duration-500
                            ${activeTab === tab.id
                                ? 'text-black'
                                : 'text-[#76727E]'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                        layoutId={`tab-button-${tab.id}`}
                    >
                        {tab.name}
                        {activeTab === tab.id && (
                            <motion.span
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                                layoutId="underline"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* API Error Message */}
            {errors.api && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ErrorMessage message={errors.api} />
                </div>
            )}

            {/* Flexible Content Area */}
            <div className="flex-1 flex flex-col gap-4 pt-4 overflow-hidden">
                {/* Tab Content */}
                {activeTab === 'addTask' && (
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex-1 flex flex-col">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Direct Task Entry</h2>
                            <p className="text-[#76727E] mb-4">Enter your task details below.</p>

                            {/* Title Field */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={taskTitle}
                                    onChange={(e) => {
                                        setTaskTitle(e.target.value);
                                        if (errors.taskTitle) {
                                            setErrors(prev => ({ ...prev, taskTitle: '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('taskTitle')}
                                    placeholder="Task Title (e.g., Buy groceries)"
                                    className={`w-full p-3 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-800 ${
                                        errors.taskTitle ? 'border-red-300 focus:ring-red-500' : ''
                                    }`}
                                />
                                {errors.taskTitle && <ErrorMessage message={errors.taskTitle} />}
                            </div>

                            {/* Description Field */}
                            <div className="flex-1 flex flex-col">
                                <textarea
                                    value={taskDescription}
                                    onChange={(e) => {
                                        setTaskDescription(e.target.value);
                                        if (errors.taskDescription) {
                                            setErrors(prev => ({ ...prev, taskDescription: '' }));
                                        }
                                    }}
                                    onBlur={() => handleFieldBlur('taskDescription')}
                                    placeholder="Task Description (e.g., Pick up milk, eggs, and bread from the store)"
                                    rows={4}
                                    className={`w-full flex-1 p-3 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-800 resize-none ${
                                        errors.taskDescription ? 'border-red-300 focus:ring-red-500' : ''
                                    }`}
                                />
                                {errors.taskDescription && <ErrorMessage message={errors.taskDescription} />}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'messageOrEmail' && (
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex-1 flex flex-col">
                            <h2 className="text-2xl font-semibold text-gray-700 mb-4">From WhatsApp/Email</h2>
                            <p className="text-[#76727E] mb-4">Paste your message or email content here. We'll extract tasks from it.</p>
                            <div className="flex-1 flex flex-col">
                                <textarea
                                    value={emailMessage}
                                    onChange={(e) => {
                                        setEmailMessage(e.target.value);
                                        if (errors.summary) {
                                            setErrors(prev => ({ ...prev, summary: '' }));
                                        }
                                    }}
                                    placeholder="Paste your WhatsApp message or email content here..."
                                    className={`w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-800 resize-none flex-1 ${
                                        errors.summary ? 'border-red-300 focus:ring-red-500' : ''
                                    }`}
                                />
                                {errors.summary && <ErrorMessage message={errors.summary} />}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 flex-1 bg-[#FAFAFA] rounded-lg border border-gray-200 flex flex-col gap-4 overflow-hidden">
                            <div className="flex justify-between flex-shrink-0">
                                <div className="flex-col flex gap-2">
                                    <h2 className="text-2xl font-semibold font-roboto">Summarize & Taskify</h2>
                                    <p className="text-[#76727E] max-w-[80%] font-overused-grotesk font-medium"></p>
                                </div>
                                <motion.button
                                    onClick={isListening ? stopListening : startListening}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 h-max px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                        isListening
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : 'bg-black text-white hover:bg-gray-800'
                                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isListening ? (
                                        <>
                                            <Square size={16} />
                                            Stop
                                        </>
                                    ) : (
                                        <>
                                            <Mic size={16} />
                                            Record
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {isListening && (
                                <div className="flex items-center gap-2 text-sm text-[#76727E] flex-shrink-0">
                                    <motion.div
                                        className="w-2 h-2 bg-red-500 rounded-full"
                                        animate={{ opacity: [1, 0.3, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                    Listening...
                                </div>
                            )}

                            <div className="flex-1 flex flex-col">
                                <textarea
                                    ref={textareaRef}
                                    value={transcript ? transcript + " " + interimTranscript : transcript + interimTranscript}
                                    onChange={handleTextChange}
                                    placeholder="Speak or paste your meeting summary/notes below. We'll intelligently analyze the content to identify action items, decisions, and follow-ups, helping you organize them into clear, actionable tasks. You can edit the text directly at any time."
                                    className={`w-full p-3 flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-gray-800 resize-none overflow-y-auto ${
                                        isListening ? 'bg-gray-50' : 'bg-white'
                                    } ${errors.summary ? 'border-red-300 focus:ring-red-500' : ''}`}
                                />
                                {errors.summary && <ErrorMessage message={errors.summary} />}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Footer Button */}
            <div className="flex-shrink-0 pt-4 pb-4">
                <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300 shadow-md ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
};

export default AddTask;