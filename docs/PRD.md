================================================================================
                        GIGNEST — PRODUCT REQUIREMENTS DOCUMENT (PRD)
================================================================================

PROJECT NAME
----------
GigNest — A modern freelance marketplace connecting freelancers and clients
with smart search, proposals, contracts, messaging, reviews, portfolios,
timely notifications, smooth UI and animations.

VISION
----------
GigNest empowers clients to find quality talent and freelancers to find
meaningful work by blending intuitive design, skill-based search, seamless
communication and trust mechanisms.

GOALS
----------
• Professional 2-sided marketplace like Upwork/Fiverr  
• Modern UI with smooth animations and clear user flows  
• Skill-centric search & matching  
• Portfolio & resume support  
• Contract + rating lifecycle

TARGET AUDIENCE
----------
• Freelancers seeking remote or contract work  
• Clients looking to hire vetted talent  
• Admins managing platform quality

SUCCESS METRICS
----------
• Conversion: job view → proposal  
• Contracts completed  
• User retention 30/60/90  
• Average rating score  
• Session duration (engagement)

================================================================================
                                FEATURES
================================================================================

AUTHENTICATION
----------
• Register / Login  
• Role selection: Client or Freelancer  
• Secure hashed passwords + JWT  
• Email validation  
• Forgot password

ROLE DASHBOARDS
----------
Clients and Freelancers have separate dashboard experiences.

CLIENT FEATURES
----------
• Create/Edit Jobs  
• View Proposals  
• Accept/Reject Proposals  
• Create Contracts  
• Messaging with Freelancers  
• Leave Reviews  
• Bookmark Freelancers  
• Notification center

FREELANCER FEATURES
----------
• Browse Jobs  
• Skill-based search & filters  
• Submit/Withdraw Proposal  
• View Contracts  
• Messaging  
• Leave Reviews  
• Upload Resume (PDF/Link)  
• Portfolio section (multiple links + project cards)  
• Skill badges  
• Availability status

ADMIN FEATURES (OPTIONAL)
----------
• Review flagged users/jobs  
• Analytics dashboard  
• Suspend users/jobs

================================================================================
                          UI / UX SPECIFICATION
================================================================================

DESIGN PHILOSOPHY
----------
Modern, clean, minimal, vivid accent colors, generous spacing,
clarity first, smooth transitions and micro-animations.
Refer design inspiration from:
• https://dribbble.com/shots/17357584-Joboard-Job-Seeker-Landing-Page-Website  
• https://dribbble.com/shots/17212797-Job-finder-landing-page  
• https://dribbble.com/shots/17682719-UI-Design-Job-Seeker-Website-Landing-Page  
• https://dribbble.com/shots/19338701-Job-Portal-Landing-Page-design-Job-Finder-Website-UI-design  

PRIMARY COLORS
----------
• Primary Accent — #4F46E5 (Indigo)  
• Secondary Accent — #06B6D4 (Cyan)  
• Neutrals — #F9FAFB, #E5E7EB, #6B7280  
• Dark Mode base — #111827

TYPOGRAPHY
----------
• Headings — Poppins / Montserrat  
• Body — Inter

ANIMATIONS
----------
Use subtle transitions:
• Fade-in on page load  
• Hover lift on buttons/cards  
• Smooth form transitions  
• Slide-in side panels (dashboard menus)  
• Toast notifications

RESPONSIVE
----------
• Mobile-first design  
• Breakpoints: 640px, 768px, 1024px, 1280px

================================================================================
                             UI PAGE STRUCTURE
================================================================================

LANDING PAGE (PUBLIC)
----------
SECTIONS
1) Hero
   • Headline, subtext  
   • Search bar: “Search jobs / skills”  
   • CTA buttons  
   • Smooth fade + scale animation
2) Stats
   • Counters (Freelancers, Jobs, Completed projects)
3) How it Works
   • 3 step card layout
4) Featured Jobs Carousel
   • Auto scroll + manual swipe
5) Testimonials
   • Carousel with user feedback cards
6) Footer
   • Links: About, Contact, Socials

ABOUT PAGE
----------
• Company mission  
• Core values  
• Meet the team cards  
• Fade-up on scroll

CONTACT PAGE
----------
• Contact form  
• Google map embed (static or screenshot)  
• Social links  
• Snackbar success toast on submit

AUTH PAGES
----------
• Register & Login
• Animated tab switch (Login ↔ Register)
• Form validation feedback

JOB LISTING (PUBLIC / FREELANCER)
----------
• Search bar + filters (skills, budget, experience)
• Job cards grid
• Hover elevation + quick apply button

JOB DETAILS PAGE
----------
• Full description
• Skills badges
• Client summary
• Apply section

POST JOB PAGE (CLIENT)
----------
• Form wizard:
   Step 1 – Job basics
   Step 2 – Skills required
   Step 3 – Budget & deadline
   Step 4 – Preview
• Smooth step transitions

================================================================================
                          DASHBOARD DEFINITIONS
================================================================================

CLIENT DASHBOARD
----------
• Overview
   • Active Jobs
   • Pending Proposals
   • Active Contracts
   • Notifications
• My Jobs
   • Job list with status badges
   • Edit/Delete
• Proposal Center
   • See all proposals
   • Accept/Reject
   • Proposal filtering
• Contracts
   • Track contract lifecycle
   • Payment status toggle
• Messaging
   • Chat UI (2-pane)
   • Typing feedback
• Profile / Settings

FREELANCER DASHBOARD
----------
• Overview
   • Suggested jobs (match %)  
   • Submitted proposals  
   • Active contracts  
• Job Search
   • Filters + skill match scoring
• My Proposals
   • Withdraw option
• Contracts
   • Mark deliverables
   • Leave review after completion
• Portfolio
   • Add/Edit portfolio links
   • Upload screenshots
• Resume Upload
   • PDF upload
   • Download link for clients
• Messaging
   • Live chat area
• Profile / Settings

================================================================================
                          ANIMATIONS & MICRO-INTERACTIONS
================================================================================

• Page Load: fade from bottom  
• Buttons: gentle scale on hover  
• Cards: shadow lift on hover  
• Form Inputs: border accent on focus  
• Toasts: slide from top-right  
• Navigation transitions between dashboard views

================================================================================
                                  END OF DOCUMENT
================================================================================