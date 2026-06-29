# Phishing Awareness Training Platform — Build Phases

## Phase 1 — Project Setup & Foundation

**Goal:** Scaffold the Next.js app and establish all shared infrastructure.

Tasks:
- Init Next.js 14 (App Router) with TypeScript and Tailwind CSS
- Install dependencies: shadcn/ui, framer-motion, lucide-react, react-hook-form, jspdf, html2canvas
- Configure Tailwind with brand color tokens (green, white, grey, black)
- Define global TypeScript types and interfaces (Module, Quiz, Flashcard, Achievement, UserProgress)
- Build localStorage progress store (XP, unlocked modules, quiz scores, achievements, streaks)
- Set up base layouts: root layout, sidebar, header, XP/level display bar

---

## Phase 2 — Course Structure & Navigation

**Goal:** Build the dashboard and routing system that drives the entire learning journey.

Tasks:
- Landing/dashboard page with module cards showing locked/unlocked states
- Lock icons for incomplete modules, unlock animations on completion
- Module routing: `/modules/[id]` dynamic routes
- Sidebar navigation with per-module progress indicators
- Lock/unlock gate logic (lesson viewed + flashcards done + voice skipped/done + quiz passed)
- Overall course progress bar and completion percentage display
- Indicate the time it would take to finish the reading (5 min)

---

## Phase 3 — Module Content (6 Modules)

**Goal:** Deliver deeply researched, interactive educational content across all modules.
-indicate refrences

### Module 1 — Introduction to Phishing
- What phishing is, history and evolution
- Why it remains the #1 attack vector (DBIR, CISA stats)
- The psychology of phishing: urgency, authority, fear, social proof
- Overview of the phishing kill chain

### Module 2 — Types of Phishing
- Spear phishing, Whaling, Clone phishing
- Smishing (SMS), Vishing (voice), Quishing (QR codes)
- Business Email Compromise (BEC)
- OAuth phishing, MFA fatigue attacks
- Credential harvesting techniques
-give detailed breakdown in each case with an example

### Module 3 — How Attackers Operate
- Campaign preparation and reconnaissance
- Common phishing toolkits (GoPhish, Evilginx, etc.)
- Domain spoofing, lookalike domains, homograph attacks
- Email header spoofing and DKIM/SPF bypass tactics

### Module 4 — Advanced & Emerging Threats
- AI-generated phishing emails
- Deepfake-assisted social engineering (voice/video)
- Adversary-in-the-middle (AiTM) phishing
- Emerging trends: QR phishing in corporate settings, mobile-first attacks

### Module 5 — Real-World Case Studies
Each case study includes: timeline, target, attack method, impact, financial losses, lessons learned, prevention.

Cases:
1. Google Docs phishing campaign
2. Twitter Bitcoin scam (2020)
3. Colonial Pipeline (credential compromise)
4. RSA Security breach
5. Ubiquiti Business Email Compromise ($47M)
6. Facebook & Google supplier invoice fraud ($100M)
7. MGM Resorts social engineering attack
8. Microsoft 365 credential phishing campaigns
9. COVID-19 phishing campaigns
10. DHL & FedEx phishing scams
11. Banking phishing campaigns
12. PayPal credential theft attacks

Interactive features per case: expandable sections, animated attack-flow diagrams, interactive timelines.

### Module 6 — Defense & Best Practices
- How to spot phishing emails (headers, links, urgency cues)
- URL inspection techniques
- MFA best practices
- Reporting phishing in enterprise environments
- Security tools: email gateways, browser extensions, DNS filtering
- Organisational defenses: security awareness programs, simulated phishing

**Lesson component types used across all modules:**
- Click-to-reveal cards
- Expandable accordion sections
- Animated diagrams
- Hover tooltips with explanations
- Interactive timelines
- Side-by-side comparisons
- Real-world example callouts

---

## Phase 4 — Flashcard System

**Goal:** Animated flashcard review before every quiz.

Tasks:
- 3D flip card animation (front: keyword/question, back: definition + example)
- Controls: Previous, Next, Shuffle, Flip, Mark as Known, Review Later
- Randomize deck button
- Per-deck progress indicator (e.g. "8 / 20 known")
- Completion gate: all cards reviewed before quiz unlocks
- Smooth Framer Motion flip transitions

---

## Phase 5 — Quiz Engine

**Goal:** Mandatory, randomized quizzes with rich feedback and a progressive hint system.

Tasks:
- Question types:
  - Multiple Choice
  - Multiple Select
  - True / False
  - Hotspot Detection (click the suspicious element)
  - Drag & Drop
  - Scenario Analysis
  - Match the Pair
  - Email Inspection
  - Fake Website Inspection
  - URL Recognition
  - Timeline Ordering
  - Decision Making
- Randomized question pool per attempt
- 80% passing score (configurable constant)
- Progressive 3-tier hint system displayed in glassmorphism cards:
  - Hint 1: small clue (−5 XP)
  - Hint 2: more guidance (−10 XP)
  - Hint 3: near-reveal (−15 XP)
- Correct answer: success animation + XP gained + explanation
- Incorrect answer: gentle shake + explanation + retry + flashcard suggestion
- Results screen: score, XP earned, pass/fail, retry or continue

---

## Phase 6 — Interactive Simulations

**Goal:** Realistic cybersecurity exercises where users actively investigate.

Simulations:
- Outlook inbox — spot phishing email among legitimate ones
- Gmail inbox — identify suspicious senders, headers, links
- Fake Microsoft login page — identify red flags
- Fake Google login page
- Fake PayPal page
- Suspicious SMS conversation
- Phone scam transcript (vishing)
- QR code phishing scenario
- Microsoft Teams phishing message
- Slack phishing message
- Browser security warning page

Each simulation: interactive elements, hover-to-inspect, click-to-flag, scored feedback.

---

## Phase 7 — Voice Summary Player

**Goal:** AI-style narrated module summary before and after each quiz.
https://github.com/pipecat-ai/pipecat.git,

Tasks:
- Web Speech API (SpeechSynthesis) integration
- Pre-quiz: narrate key module concepts
- Post-quiz: short reinforcement recap
- Controls: Play, Pause, Replay, Playback Speed (0.75×, 1×, 1.25×, 1.5×, 2×), Mute
- Transcript toggle (show/hide full text)
- Estimated listening time display
- Manual skip option (marks voice step as complete)

---

## Phase 8 — Gamification Layer

**Goal:** Keep users motivated throughout the course.

Tasks:
- XP system: earned from lessons, flashcards, quiz answers, simulations
- Level system: levels 1–10 with titles (e.g. "Rookie" → "Cyber Guardian")
- Badges and achievements (e.g. "First Quiz Passed", "Streak 3 Days", "Perfect Score")
- Learning streak tracker (daily activity)
- Animated progress bars and XP counter
- Milestone celebrations: confetti burst on module completion
- Module completion badges displayed on dashboard
- Achievement popup toasts (slide-in with icon + message)
- Course completion badge (special animated reveal)

---

## Phase 9 — Certificate Generator

**Goal:** Professional, branded PDF certificate on course completion.

Tasks:
- Name input modal triggered on final module completion
- Certificate design:
  - User full name (large, elegant typography)
  - Course title: "Phishing Awareness Training"
  - Completion date
  - Final average score
  - Unique certificate ID (UUID)
  - Organisation logo and brand colors (green/white/black)
  - Elegant border design
  - Signature area
  - Optional QR code linking to verification
- Animated certificate reveal (scale + fade in)
- Download as PDF (jspdf + html2canvas)
- Print certificate option

---

## Phase 10 — Polish & Accessibility

**Goal:** Ensure a premium, inclusive, fully responsive experience.

Tasks:
- Micro-interactions: hover lift, ripple clicks, button glow
- Smooth page transitions (Framer Motion `AnimatePresence`)
- Animated counters for stats
- Floating background shapes / subtle parallax
- Glass blur transitions
- Scroll-triggered animations (Intersection Observer)
- Keyboard navigation for all interactive elements
- ARIA labels and roles throughout
- Screen reader compatibility
- High contrast mode support
- Reduced motion mode (respects `prefers-reduced-motion`)
- Fully responsive: mobile, tablet, desktop
- Dark mode toggle (optional, light default)

---

## Dependency Reference

```
next@14
react
typescript
tailwindcss
@shadcn/ui
framer-motion
lucide-react
react-hook-form
jspdf
html2canvas
canvas-confetti
```

---

## Progress Tracker

| Phase | Status     |
|-------|------------|
| 1     | Not started |
| 2     | Not started |
| 3     | Not started |
| 4     | Not started |
| 5     | Not started |
| 6     | Not started |
| 7     | Not started |
| 8     | Not started |
| 9     | Not started |
| 10    | Not started |
