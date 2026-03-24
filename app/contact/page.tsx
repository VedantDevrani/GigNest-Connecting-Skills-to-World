'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        let newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address is invalid';
        }
        if (!formData.subject) newErrors.subject = 'Subject is required';
        if (!formData.message) newErrors.message = 'Message is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            setIsSubmitting(true);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsSubmitting(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
            toast({
                type: 'success',
                message: 'Message sent successfully! We will get back to you soon.',
            });
        } else {
            toast({
                type: 'error',
                message: 'Please fill out all required fields correctly.',
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-gray-100">

            <section className="pt-32 pb-24 max-w-[1280px] mx-auto px-6">
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                    {/* LEFT COLUMN: Contact Info */}
                    <motion.div variants={fadeInUp} className="space-y-12">
                        <div>
                            <h1 className="text-5xl font-bold font-poppins mb-6 tracking-tight">Let's start a <br /> <span className="text-primary">conversation.</span></h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                                Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                            </p>
                        </div>

                        <div className="space-y-8 pt-8 border-t border-gray-100 dark:border-gray-800/50">
                            {[
                                { icon: <Mail className="w-6 h-6" />, label: "Chat to us", desc: "Our friendly team is here to help.", info: "hello@gignest.com" },
                                { icon: <MapPin className="w-6 h-6" />, label: "Office", desc: "Come say hello at our office HQ.", info: "100 Smith Street, Collingwood VIC 3066 AU" },
                                { icon: <Phone className="w-6 h-6" />, label: "Phone", desc: "Mon-Fri from 8am to 5pm.", info: "+1 (555) 000-0000" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 group cursor-pointer">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0 shadow-sm border border-gray-100 dark:border-gray-700">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold font-poppins text-lg">{item.label}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-2">{item.desc}</p>
                                        <span className="font-medium text-primary hover:underline">{item.info}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: Contact Form */}
                    <motion.div variants={fadeInUp} className="bg-[#fafbfc] dark:bg-[#13111c] rounded-[32px] p-8 md:p-12 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold font-poppins">Send us a message</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">First Name *</label>
                                    <Input
                                        name="name"
                                        placeholder="Jane"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Email *</label>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="jane@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Subject *</label>
                                <Input
                                    name="subject"
                                    placeholder="How can we help?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={errors.subject ? 'border-red-500 focus:ring-red-500' : ''}
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Message *</label>
                                <Textarea
                                    name="message"
                                    placeholder="Tell us a little more about what you need..."
                                    rows={5}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-6 text-lg group flex items-center justify-center gap-2 mt-4"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                                )}
                            </Button>
                        </form>
                    </motion.div>

                </motion.div>
            </section>
        </main>
    );
}
