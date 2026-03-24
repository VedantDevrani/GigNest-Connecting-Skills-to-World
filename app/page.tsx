'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import {
  Search, ArrowUpRight, ArrowRight, Building2,
  BadgeCheck, Star, CheckCircle2, ShieldCheck, Zap,
  ChevronLeft, ChevronRight, Quote, Clock, MapPin, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Smooth Counter component
function AnimatedCounter({ end, suffix = "+" }: { end: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView) {
      let startTime: number | null = null;
      const duration = 2000; // 2 seconds

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);

        // easeOutQuart
        const easeProgress = 1 - Math.pow(1 - progress, 4);

        setCount(Math.floor(easeProgress * end));

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, end]);

  return (
    <span ref={ref}>
      {count >= 1000 ? (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + 'k' : count}{suffix}
    </span>
  );
}

// Reusable Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-gray-900 dark:text-gray-100 overflow-hidden">

      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-gradient-to-b from-[#faf9ff] to-white dark:from-[#13111c] dark:to-[#0a0a0a] pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden border-b border-gray-100 dark:border-gray-800">
        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[120%] bg-primary/5 blur-[100px] rounded-full point-events-none"></div>
        <div className="absolute top-[20%] right-[-15%] w-[60%] h-[150%] bg-blue-500/5 blur-[120px] rounded-full point-events-none"></div>

        <div className="max-w-[1280px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="w-full lg:w-[55%] pb-8 pr-4"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm mb-8 w-max">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Over <strong className="text-gray-900 dark:text-white">10,000+</strong> active jobs worldwide</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold font-poppins leading-[1.1] tracking-tight mb-6"
            >
              Hire the world's best <br className="hidden md:block" />
              <span className="relative inline-flex items-center">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">freelance talent.</span>
                <BadgeCheck className="w-8 h-8 md:w-12 md:h-12 text-blue-500 ml-2 mt-2 absolute -right-10 md:-right-14 hidden sm:block" fill="#3b82f6" stroke="white" />
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
              Find the perfect match for your project, scale your team seamlessly, and get work done faster than ever. The #1 destination for top-tier remote work.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full">
              <Link href="/freelancers" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto px-8 py-5 text-lg shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all">
                  Hire Talent Now <ArrowUpRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto px-8 py-5 text-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 transition-all">
                  Find Work Instead
                </Button>
              </Link>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={fadeInUp} className="w-full max-w-xl bg-white dark:bg-gray-900 p-2 md:p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full flex items-center px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 dark:border-gray-800">
                  <Search className="w-5 h-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-200 text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto px-6 py-3 sm:ml-2 rounded-xl">
                  Search Jobs
                </Button>
              </form>
            </motion.div>
          </motion.div>

          {/* Right Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-[45%] relative mt-16 lg:mt-0 flex justify-center"
          >
            <div className="relative w-full max-w-[500px] aspect-square drop-shadow-2xl">
              <Image
                src="/hero_home.png"
                alt="Modern Freelancer Illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. STATS SECTION (Animated) */}
      <section className="w-full py-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100 dark:divide-gray-800">
          {[
            { label: 'Active Jobs', value: 45000, suffix: '+' },
            { label: 'Verified Freelancers', value: 120000, suffix: '+' },
            { label: 'Client Satisfaction', value: 99, suffix: '%' },
            { label: 'Millions Paid Out', value: 250, suffix: 'M+' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`flex flex-col items-center justify-center p-4 ${i % 2 !== 0 && i < 2 ? 'border-none md:border-l' : ''}`}
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 font-poppins">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED JOBS CAROUSEL */}
      <section className="w-full bg-[#fcfcfc] dark:bg-[#111] py-28 overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 font-poppins">Top Featured Jobs</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">Land your dream role today. Here are the most viewed contract opportunites right now.</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-2 text-primary font-semibold hover:underline group">
              View all jobs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* CSS Scroll Snap Container */}
          <motion.div
            initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scroll-bar gap-6 pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {[
              { title: 'Senior React Engineer', company: 'Stripe', salary: '$120 - $140k', type: 'Contract', loc: 'Remote', tags: ['React', 'Next.js', 'TypeScript'] },
              { title: 'Lead Product Designer', company: 'Figma', salary: '$90k - $110k', type: 'Full-time', loc: 'San Francisco, CA', tags: ['UI/UX', 'Figma', 'Prototyping'] },
              { title: 'Blockchain Developer', company: 'Coinbase', salary: '$180k+', type: 'Contract', loc: 'Remote', tags: ['Web3', 'Solidity', 'Rust'] },
              { title: 'Growth Marketing Manager', company: 'Notion', salary: '$85k - $100k', type: 'Hourly', loc: 'New York, NY', tags: ['SEO', 'Growth', 'B2B'] },
            ].map((job, i) => (
              <div key={i} className="min-w-[320px] max-w-[400px] flex-shrink-0 snap-start bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-8 shadow-[0_5px_20px_rgb(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold font-poppins text-lg flex items-center justify-center text-gray-900 dark:text-white mb-6">
                  {job.company[0]}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 font-poppins">{job.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                  <span className="text-gray-900 dark:text-gray-200 font-bold">{job.company}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.loc}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {job.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-lg border border-gray-100 dark:border-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Salary</p>
                    <p className="font-bold text-gray-900 dark:text-white">{job.salary}</p>
                  </div>
                  <Link href="/jobs">
                    <button className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SLIDER */}
      <section className="w-full bg-white dark:bg-[#0a0a0a] py-32 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-[1280px] mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-poppins text-gray-900 dark:text-white mb-6">Trusted by businesses <br className="hidden md:block" /> and freelancers globally.</h2>
            <div className="flex justify-center items-center gap-1 text-yellow-400 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-current" />)}
            </div>
            <p className="text-gray-500 font-medium">4.9/5 Rating based on 10,000+ reviews</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "GigNest completely transformed how we build teams. The talent quality is unmatched and the platform is incredibly intuitive.", author: "Sarah Jenkins", role: "CTO, TechFlow", img: 12 },
              { text: "As a freelance designer, I've increased my revenue by 300% since joining. The clients are professional and payments are always on time.", author: "David Chen", role: "UI/UX Designer", img: 15 },
              { text: "We needed a senior React developer fast. Within 24 hours we had conducted interviews and signed a contract. Absolutely blazing fast.", author: "Emily Rodriguez", role: "Product Manager, Startup Inc", img: 20 },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-[#fafbfc] dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 relative"
              >
                <Quote className="w-10 h-10 text-primary/20 absolute top-8 right-8" />
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 relative z-10 italic">"{t.text}"</p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden relative">
                    <Image src={`https://i.pravatar.cc/150?u=${t.img}`} alt={t.author} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white font-poppins">{t.author}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section className="w-full py-24 px-6 bg-white dark:bg-[#0a0a0a] relative overflow-hidden">
        {/* Background blobs for CTA */}
        <div className="absolute inset-0 w-full h-full justify-center items-center flex pointer-events-none opacity-20 dark:opacity-10 z-0">
          <div className="w-[800px] h-[400px] bg-primary rounded-[100%] blur-[120px]"></div>
        </div>

        <div className="max-w-[1000px] mx-auto bg-[#1A162B] rounded-[40px] p-12 md:p-20 text-center relative z-10 shadow-2xl overflow-hidden group">
          {/* Animated bg ring inside CTA container */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-[1px] border-white/5 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border-[1px] border-white/10 rounded-full group-hover:scale-105 transition-transform duration-700"></div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="relative z-10">
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold font-poppins text-white tracking-tight mb-8">
              Ready to transform the <br /> way you work?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 text-lg max-w-xl mx-auto mb-12">
              Join thousands of businesses and professionals who are already experiencing the future of work.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button className="w-full sm:w-auto px-8 py-6 text-lg bg-white !text-[#1A162B] hover:bg-gray-100 border-none shadow-xl hover:scale-105 transition-all">
                  Get Started Now
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg text-white border-white/20 hover:bg-white/10 hover:text-white transition-all">
                  Browse Jobs
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scroll-bar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </main>
  );
}
