'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check, ChevronRight, ChevronLeft, Briefcase, Plus, X } from 'lucide-react';

const steps = [
    { id: 1, title: 'Basics' },
    { id: 2, title: 'Skills' },
    { id: 3, title: 'Details' },
    { id: 4, title: 'Preview' },
];

export default function CreateJobPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        skills: [] as string[],
        newSkill: '',
        budget: '',
        deadline: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSkill = () => {
        if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, formData.newSkill.trim()],
                newSkill: ''
            });
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills.filter(s => s !== skillToRemove)
        });
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await fetch('/api/client/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    skills: formData.skills,
                    budget: parseFloat(formData.budget),
                    deadline: formData.deadline
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create job');
            }

            router.push('/client/jobs');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    // Transition variants for smooth sliding
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 fade-in pb-20">
            <div>
                <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">Post a New Job</h1>
                <p className="text-gray-500 mt-1">Connect with top freelancers around the world.</p>
            </div>

            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full z-0"></div>
                <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step) => (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${currentStep > step.id ? 'bg-primary text-white' :
                                currentStep === step.id ? 'bg-primary text-white ring-4 ring-primary/20' :
                                    'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                            }`}>
                            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                            {step.title}
                        </span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                    {error}
                </div>
            )}

            {/* Form Content */}
            <Card className="p-8 bg-white dark:bg-gray-900 border-none shadow-[0_5px_40px_rgba(0,0,0,0.05)] min-h-[400px] overflow-hidden relative">
                <AnimatePresence mode="wait" custom={1}>
                    {currentStep === 1 && (
                        <motion.div
                            key="step1"
                            custom={1}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold font-poppins text-gray-900 dark:text-white">Title & Description</h2>
                            <p className="text-gray-500 text-sm">Give your job a clear, descriptive title to attract the right candidates.</p>

                            <Input
                                label="Job Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Senior Full-Stack Next.js Developer"
                                required
                            />

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Project Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-gray-900 dark:text-gray-100"
                                    placeholder="Describe the scope of work, deliverables, and any specific requirements..."
                                    required
                                />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div
                            key="step2"
                            custom={1}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold font-poppins text-gray-900 dark:text-white">Required Skills</h2>
                            <p className="text-gray-500 text-sm">Add relevant tags to help freelancers find your job faster.</p>

                            <div className="flex gap-2">
                                <Input
                                    label="Add Skill"
                                    name="newSkill"
                                    value={formData.newSkill}
                                    onChange={handleChange}
                                    placeholder="e.g. React, UI/UX, Node.js"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                />
                                <div className="mt-[28px]">
                                    <Button type="button" onClick={handleAddSkill} className="px-4">
                                        <Plus className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-6">
                                {formData.skills.length === 0 && <p className="text-gray-400 text-sm italic">No skills added yet.</p>}
                                {formData.skills.map(skill => (
                                    <span key={skill} className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold tracking-tight text-sm">
                                        {skill}
                                        <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div
                            key="step3"
                            custom={1}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold font-poppins text-gray-900 dark:text-white">Budget & Timeline</h2>
                            <p className="text-gray-500 text-sm">Define your financials and expectations to attract serious proposals.</p>

                            <Input
                                label="Fixed Budget (USD)"
                                name="budget"
                                type="number"
                                value={formData.budget}
                                onChange={handleChange}
                                placeholder="e.g. 1500"
                                required
                            />

                            <Input
                                label="Deadline / Expected Delivery Date"
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                            />
                        </motion.div>
                    )}

                    {currentStep === 4 && (
                        <motion.div
                            key="step4"
                            custom={1}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold font-poppins text-gray-900 dark:text-white">Review & Post</h2>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                                <div>
                                    <h3 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-2">{formData.title || 'Untitled Job'}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{formData.description || 'No description provided.'}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {formData.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-lg text-gray-600 dark:text-gray-300">{skill}</span>
                                    ))}
                                </div>

                                <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Budget</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">${formData.budget || '0'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{formData.deadline ? new Date(formData.deadline).toLocaleDateString() : 'Not set'}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-800">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || loading}
                    className="flex items-center gap-2 px-6"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </Button>

                {currentStep < steps.length ? (
                    <Button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8"
                        disabled={
                            (currentStep === 1 && (!formData.title || !formData.description)) ||
                            (currentStep === 3 && (!formData.budget || !formData.deadline))
                        }
                    >
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        className="px-8 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25"
                        disabled={loading}
                    >
                        {loading ? 'Posting...' : 'Post Job Now'} <Check className="w-5 h-5 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}
