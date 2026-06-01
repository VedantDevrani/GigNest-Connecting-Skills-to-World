'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Heart, Zap, Shield, Github, Mail } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-gray-100 pb-32">

            {/* HERO */}
            <section className="pt-24 pb-16 bg-[#faf9ff] dark:bg-[#13111c] border-b border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
                <div className="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary-color)_0,transparent_50%)] opacity-5 pointer-events-none"></div>

                <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-[800px] mx-auto px-6 relative z-10">
                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl font-bold font-poppins mb-6 tracking-tight">
                        Built for the future <br /> of <span className="text-primary">freelance work.</span>
                    </motion.h1>
                    <motion.p variants={fadeInUp} className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        GigNest was founded on a simple premise: finding great talent and finding great work shouldn't be a fragmented, painful experience. We are building the compliant global infrastructure for modern work.
                    </motion.p>
                </motion.div>
            </section>

            {/* VALUES */}
            <section className="py-24 max-w-[1280px] mx-auto px-6">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: <Target className="w-6 h-6" />, title: "Mission Driven", desc: "We are obsessed with creating economic opportunity for every member of the global workforce." },
                        { icon: <Heart className="w-6 h-6" />, title: "People First", desc: "Technology should serve people, not the other way around. We build tools that empower." },
                        { icon: <Zap className="w-6 h-6" />, title: "Move Fast", desc: "The future of work is changing rapidly. We iterate quickly to stay ahead of the curve." },
                        { icon: <Shield className="w-6 h-6" />, title: "Built on Trust", desc: "Security and compliance are never afterthoughts. They are the foundation of GigNest." },
                    ].map((val, i) => (
                        <motion.div key={i} variants={fadeInUp} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-[24px] hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                                {val.icon}
                            </div>
                            <h3 className="text-xl font-bold font-poppins mb-3">{val.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{val.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* TEAM SECTION */}
            <section className="py-24 max-w-[1280px] mx-auto px-6 border-t border-gray-100 dark:border-gray-800/50">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold font-poppins mb-4">Meet the makers</h2>
                    <p className="text-gray-500 dark:text-gray-400">The team working hard to build the future of work.</p>
                </div>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="flex justify-center mt-8">
                    {[
                        { name: "Vedant Devrani", role: "Developer", img: "/MyImage.png" },
                    ].map((member, i) => (
                        <motion.div key={i} variants={fadeInUp} className="group cursor-pointer max-w-md mx-auto w-full">
                            <div className="relative w-full aspect-square mb-4 bg-gray-100 dark:bg-gray-800 holographic-card">
                                <Image
                                    src={member.img}
                                    alt={member.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="text-center mt-6">
                                <h3 className="font-bold text-3xl font-poppins group-hover:text-primary transition-colors mb-1">{member.name}</h3>
                                <p className="text-md text-gray-500 dark:text-gray-400 mb-4">{member.role}</p>
                                <div className="flex flex-col items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                                    <a href="mailto:vedantdevrani177@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <Mail className="w-4 h-4" /> vedantdevrani177@gmail.com
                                    </a>
                                    <a href="https://github.com/VedantDevrani" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <Github className="w-4 h-4" /> github.com/VedantDevrani
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

        </main>
    );
}
