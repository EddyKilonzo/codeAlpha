import type { LessonCard, ModuleSection } from './attacker-operations'

export const INTRODUCTION_CONTENT: ModuleSection[] = [
  {
    id: 'what-is-phishing',
    title: 'What Is Phishing?',
    icon: 'Eye',
    description: 'Phishing is a cyberattack that uses deception — not technical exploits — to steal credentials, money, or data. Understanding its mechanics is the first step to recognizing it.',
    cards: [
      {
        id: 'ph-definition',
        type: 'reveal',
        title: 'The Core Definition',
        summary: 'Phishing is social engineering via digital communication. Click to reveal the full picture.',
        detail: 'Phishing uses deceptive emails, messages, or websites to trick people into revealing sensitive information (passwords, card numbers) or installing malware. The name comes from "fishing" — attackers cast a wide net hoping victims take the bait. Unlike hacking, phishing requires no technical skill to execute. The "vulnerability" being exploited is the human, not the software.',
      },
      {
        id: 'ph-prevalence',
        type: 'stat',
        title: 'The Scale of the Threat',
        summary: 'Phishing is the most common entry point for cyberattacks — by a wide margin.',
        detail: 'According to SANS Institute research, 91% of all cyberattacks begin with phishing. This makes phishing awareness the single highest-ROI security control available to any organization.',
        items: [
          '91% of all cyberattacks start with phishing (SANS)',
          '$136,000 average loss per phishing incident (IBM)',
          '3.4 billion phishing emails sent daily globally',
          '82% of breaches involve a human element (Verizon DBIR)',
          '48% increase in phishing attacks since AI tools became widely available',
        ],
      },
      {
        id: 'ph-psychology',
        type: 'expandable',
        title: 'Why Phishing Works: The Psychology',
        summary: 'Phishing exploits cognitive shortcuts that evolved for trust in face-to-face interactions — not for the modern digital world.',
        detail: 'Our brains are wired to respond to authority figures, act under time pressure, and trust familiar-looking contexts. Phishing weaponizes all of these. When we see an "urgent" email from what appears to be our CEO, multiple cognitive biases activate simultaneously — and careful, skeptical thinking shuts down.',
        items: [
          'Authority — We comply with perceived authority figures without question',
          'Urgency — Time pressure prevents careful evaluation of requests',
          'Fear — Threat of negative consequences (account locked, legal trouble) overrides reasoning',
          'Greed — Promise of gain (prize, refund) lowers our guard',
          'Familiarity — Recognizable logos and names trigger automatic trust',
          'Social proof — "Everyone else has already done this" creates pressure to comply',
        ],
      },
      {
        id: 'ph-example',
        type: 'example',
        title: 'A Classic Phishing Email Deconstructed',
        summary: 'Every element of this email was deliberately designed to trigger a specific psychological response.',
        detail: '"URGENT: Your Microsoft 365 account will be disabled in 2 hours unless you verify your identity immediately. Click the link below to keep your account active: [Verify Now]" — Urgency (2 hours), Authority (Microsoft), Fear (account disabled), Action trigger (Verify Now).',
      },
      {
        id: 'ph-kill-chain',
        type: 'diagram-steps',
        title: 'The Phishing Kill Chain',
        summary: 'Every phishing attack follows the same five-stage sequence from planning to payoff.',
        detail: 'Understanding each stage helps organizations identify which controls are most effective at each point.',
        steps: [
          { step: 1, icon: 'Search', label: 'Reconnaissance', description: 'Attacker researches targets via LinkedIn, company website, social media. Finds email patterns, reporting structures, current projects.' },
          { step: 2, icon: 'Server', label: 'Infrastructure Setup', description: 'Attacker registers lookalike domains, sets up hosting, creates fake login pages, configures email to pass spam filters.' },
          { step: 3, icon: 'Mail', label: 'Email Delivery', description: 'Phishing lures are crafted and delivered. May use compromised accounts, legitimate platforms, or spoofed addresses.' },
          { step: 4, icon: 'MousePointer', label: 'Exploitation', description: 'Victim clicks the link and enters credentials, or opens attachment that installs malware.' },
          { step: 5, icon: 'Flag', label: 'Action on Objectives', description: 'Attacker uses stolen access to steal data, deploy ransomware, commit fraud, or sell credentials.' },
        ],
      },
    ],
  },
  {
    id: 'recognizing-phishing',
    title: 'Recognizing Phishing',
    icon: 'Flag',
    description: 'Trained eyes catch what spam filters miss. These are the signals that prove a message is malicious.',
    cards: [
      {
        id: 'recognition-comparison',
        type: 'comparison',
        title: 'Legitimate Email vs. Phishing Email',
        summary: 'Side-by-side comparison of what to look for and what to ignore.',
        detail: 'Many people focus on the wrong signals (logos, professional design) while missing the reliable ones (actual domain, link destination). Here\'s what actually matters.',
        left: {
          label: 'Trust signals that CAN be faked',
          items: [
            'Company logos (easy to copy)',
            'Professional HTML design (copy-paste from real emails)',
            'Correct company colors and fonts',
            'Employee names (found on LinkedIn)',
            'Specific details (copied from previous legitimate emails)',
          ],
        },
        right: {
          label: 'Reliable signals to check',
          items: [
            'Actual sending domain (after the @ symbol)',
            'Link destination when you hover (not the display text)',
            'Whether the request was expected / you initiated it',
            'Whether it asks for credentials or payment',
            'MFA prompts you didn\'t initiate',
          ],
        },
      },
      {
        id: 'recognition-warning',
        type: 'warning',
        title: 'The HTTPS Padlock Is Not a Safety Signal',
        summary: 'Over 83% of phishing sites now use HTTPS. The padlock only means your connection is encrypted — not that the site is legitimate.',
        detail: 'Free SSL certificates (from Let\'s Encrypt) are available in minutes to anyone, including phishers. A padlock on a phishing site means your credentials are securely delivered to the attacker. Stop using the padlock as a trust signal entirely.',
      },
    ],
  },
]

export const INTRODUCTION_TAKEAWAYS = [
  'Phishing exploits human psychology, not software vulnerabilities — awareness is your primary defense.',
  '91% of all cyberattacks begin with phishing — it is the single most important threat to understand.',
  'Logos, design quality, and HTTPS padlocks can all be faked — check the actual domain and link destination.',
  'Urgency, authority, and fear are the three most common psychological triggers used in phishing.',
  'When in doubt, verify through a separate channel — phone the sender, or navigate directly to the official website.',
]
