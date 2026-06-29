import type { LessonCard, ModuleSection } from './attacker-operations'

export const ADVANCED_THREATS_CONTENT: ModuleSection[] = [
  {
    id: 'ai-phishing',
    title: 'AI-Generated Phishing',
    icon: 'Bot',
    description:
      'Large language models have fundamentally changed the scale and quality of phishing attacks. What once required skilled writers and hours of effort now takes seconds.',
    cards: [
      {
        id: 'ai-before-after',
        type: 'comparison',
        title: 'Phishing Before & After Generative AI',
        summary: 'The quality gap between traditional and AI-generated phishing is closing rapidly.',
        detail:
          'Traditional phishing emails were often identifiable by poor grammar, spelling errors, awkward phrasing, and generic greetings. Generative AI eliminates all of these tells, producing grammatically perfect, contextually aware, and culturally appropriate phishing content at unlimited scale.',
        left: {
          label: 'Traditional Phishing (Pre-AI)',
          items: [
            'Spelling and grammar errors',
            'Generic "Dear Customer" greetings',
            'Awkward phrasing and unnatural tone',
            'One template sent to thousands',
            'Easily caught by grammar-based filters',
            'Required skilled writers to be convincing',
          ],
        },
        right: {
          label: 'AI-Generated Phishing (Now)',
          items: [
            'Perfect grammar and professional tone',
            'Personalized with victim\'s name, role, context',
            'Mimics writing style of spoofed sender',
            'Infinite unique variants — no two alike',
            'Bypasses grammar-based detection',
            'Any attacker can produce boardroom-quality emails',
          ],
        },
      },
      {
        id: 'ai-tools-used',
        type: 'expandable',
        title: 'How Attackers Use LLMs',
        summary: 'The specific AI workflows malicious actors use to scale phishing operations.',
        detail:
          'Attackers use publicly available LLMs (and jailbroken versions) to automate every phase of a phishing campaign — from writing initial emails to generating entire fake websites.',
        items: [
          'Email drafting: prompt LLM with target\'s LinkedIn profile → personalized spear-phishing email',
          'Translation: localize phishing campaigns for any language or dialect instantly',
          'Style mimicry: feed an executive\'s past emails → generate convincing BEC impersonation',
          'Objection handling: AI chatbots respond to victim questions in real time during vishing',
          'Malware generation: LLMs used to write or obfuscate malicious code in attachments',
          'WormGPT / FraudGPT: uncensored LLMs sold on dark web specifically for cybercrime',
          'Phishing page generation: AI writes complete HTML credential-harvesting pages from prompts',
        ],
        example:
          'In a 2023 SANS Institute test, a researcher used ChatGPT (via jailbreak) to generate a highly convincing CEO impersonation email targeting a CFO for wire transfer, in under 90 seconds — including a backstory, urgency mechanism, and follow-up script.',
        source: 'SANS Institute AI & Cybercrime Report 2023',
      },
      {
        id: 'ai-scale',
        type: 'stat',
        title: 'The Scale Problem',
        summary: 'AI makes mass-personalization of phishing economically viable for the first time.',
        detail:
          'Spear phishing was previously limited by the cost of human research and writing time. AI eliminates this bottleneck: an attacker can now generate 10,000 fully personalized phishing emails — each referencing the target\'s name, employer, recent LinkedIn activity, and job title — in the time it previously took to write one.',
        items: [
          '96% increase in phishing email volume since ChatGPT\'s public release (SlashNext 2023)',
          '40% of organizations report AI-generated phishing as their top email threat (Perception Point 2024)',
          'AI-authored phishing emails have 3× higher click-through rate than generic templates',
          'WormGPT subscriptions cost as little as $60/month on dark web markets',
          'AI reduces spear-phishing production time from ~4 hours to under 5 minutes',
        ],
        source: 'SlashNext State of Phishing Report 2023',
      },
      {
        id: 'ai-detection',
        type: 'warning',
        title: 'Why "Spot the Typo" No Longer Works',
        summary: 'Legacy phishing detection advice is obsolete in the AI era.',
        detail:
          'Security awareness training traditionally taught users to identify phishing by spotting poor grammar, spelling errors, and generic greetings. AI-generated phishing eliminates all of these signals. Organizations must now teach context-based detection: question the request, verify through alternate channels, and never trust urgency alone — regardless of how well-written the email appears.',
        example:
          'An IBM X-Force red team assessment found that 100% of AI-crafted phishing emails in their test campaign passed the "grammar and tone" review that most employees use as their primary detection heuristic.',
      },
    ],
  },
  {
    id: 'deepfakes',
    title: 'Deepfake-Assisted Social Engineering',
    icon: 'Video',
    description:
      'AI-generated voice and video deepfakes are now being weaponized in social engineering attacks, enabling real-time impersonation of executives, colleagues, and family members.',
    cards: [
      {
        id: 'deepfake-voice',
        type: 'expandable',
        title: 'Voice Cloning Attacks',
        summary: 'AI voice cloning can replicate any person\'s voice from just 3 seconds of audio.',
        detail:
          'Modern voice cloning tools (ElevenLabs, Resemble AI, and their criminal equivalents) can clone a voice from a short audio sample found on YouTube, LinkedIn videos, or corporate presentations. The cloned voice is then used in phone calls, voicemails, or real-time call centers to impersonate executives for BEC fraud.',
        items: [
          '3–10 seconds of audio: sufficient for basic voice cloning with current tools',
          'Real-time voice changing: attackers can speak and have their voice transformed live during a call',
          'Voicemail fraud: cloned CEO voice leaves urgent voicemail requesting wire transfer',
          'Multi-step attacks: email phish followed by "confirming call" from cloned executive voice',
          'WhatsApp voice notes: cloned voice messages to family members (grandparent scams)',
          'Customer service impersonation: cloned bank representative voice for account takeover',
        ],
        example:
          'In 2019, the CEO of a UK energy company received a call from his "parent company\'s" CEO requesting an urgent €220,000 wire transfer. The caller\'s voice was an AI clone. The transfer was made. This was the first publicly documented deepfake voice fraud case.',
        source: 'Wall Street Journal — Fraudsters Use AI to Mimic CEOs\' Voices, 2019',
      },
      {
        id: 'deepfake-video',
        type: 'reveal',
        title: 'Video Deepfake Attacks',
        summary: 'Live video calls with AI-generated faces are now being used in fraud.',
        detail:
          'In 2024, a Hong Kong finance employee was tricked into transferring $25 million USD after attending a video call with what appeared to be multiple colleagues — all of whom were AI-generated deepfakes. The attacker used publicly available footage to train face-swap models and ran them in real time during the call. The employee became suspicious and called back on a legitimate number, which confirmed the fraud — but too late.',
        example:
          'Hong Kong deepfake video call fraud, February 2024: HK$200 million (≈$25M USD) transferred after an elaborate multi-person deepfake video conference. Considered the largest single deepfake fraud loss on record.',
        source: 'Hong Kong Police — February 2024',
      },
      {
        id: 'deepfake-detection',
        type: 'diagram-steps',
        title: 'How to Verify Identity in the Deepfake Era',
        summary: 'A practical protocol for verifying unexpected requests — even during video calls.',
        detail: 'No single signal is reliable. Use layered verification for high-stakes requests.',
        steps: [
          {
            step: 1,
            label: 'Pre-share a code word',
            description: 'Establish unique verification words with executives and close contacts in advance.',
            icon: 'Key',
          },
          {
            step: 2,
            label: 'Call back on known number',
            description: 'End the call. Initiate a new call to a number from the official directory — never from caller ID.',
            icon: 'Phone',
          },
          {
            step: 3,
            label: 'Use a secondary channel',
            description: 'Verify via a completely different communication method (e.g. email if the request came by phone).',
            icon: 'MessageSquare',
          },
          {
            step: 4,
            label: 'Apply a delay',
            description: 'Urgency is the attacker\'s weapon. Any legitimate request can wait 30 minutes for verification.',
            icon: 'Clock',
          },
          {
            step: 5,
            label: 'Escalate unusual requests',
            description: 'Wire transfers, credential changes, and access requests should always require dual approval.',
            icon: 'Users',
          },
        ],
      },
      {
        id: 'deepfake-trends',
        type: 'stat',
        title: 'Deepfake Fraud by the Numbers',
        summary: 'The scale and growth of deepfake-assisted social engineering.',
        detail: 'Deepfake fraud is growing faster than any other category of cybercrime.',
        items: [
          '3,000% increase in deepfake fraud attempts in 2023 vs. 2022 (Onfido)',
          '$25 million: single largest deepfake video call fraud loss (Hong Kong, 2024)',
          '$220,000: first publicly documented voice deepfake fraud (UK, 2019)',
          '66% of cybersecurity professionals have seen deepfakes used in targeted attacks (VMware)',
          'Voice cloning tools available for free online; advanced versions cost $5/month',
          'Generative AI created 500,000 deepfake videos in 2023 — up 550% from 2019',
        ],
        source: 'Onfido Identity Fraud Report 2024',
      },
    ],
  },
  {
    id: 'aitm',
    title: 'Adversary-in-the-Middle (AiTM) Phishing',
    icon: 'ArrowLeftRight',
    description:
      'AiTM attacks intercept authentication in real time, capturing session tokens that bypass MFA — representing the most sophisticated phishing technique in widespread use today.',
    cards: [
      {
        id: 'aitm-how-it-works',
        type: 'diagram-steps',
        title: 'How AiTM Attacks Work',
        summary: 'AiTM acts as a transparent proxy — the victim completes real authentication while the attacker captures the session.',
        detail: 'Unlike traditional phishing that steals a static password, AiTM captures an authenticated session that is valid even after the password is changed.',
        steps: [
          {
            step: 1,
            label: 'Victim clicks phishing link',
            description: 'Link points to attacker\'s AiTM proxy server (e.g. Evilginx2, Tycoon 2FA).',
            icon: 'MousePointer',
          },
          {
            step: 2,
            label: 'Proxy fetches real login page',
            description: 'Attacker\'s server fetches and serves the genuine Microsoft/Google login page to the victim.',
            icon: 'Globe',
          },
          {
            step: 3,
            label: 'Victim enters credentials',
            description: 'Credentials are captured by the proxy and forwarded to the real server in real time.',
            icon: 'KeyRound',
          },
          {
            step: 4,
            label: 'MFA challenge issued',
            description: 'Real server sends MFA challenge. Proxy passes it to victim. Victim completes real MFA.',
            icon: 'Smartphone',
          },
          {
            step: 5,
            label: 'Session cookie captured',
            description: 'After successful authentication, the real server issues a session cookie. Proxy intercepts it.',
            icon: 'Cookie',
          },
          {
            step: 6,
            label: 'Attacker uses session',
            description: 'Attacker injects captured cookie into their browser. They are authenticated — no password, no MFA needed.',
            icon: 'Unlock',
          },
        ],
      },
      {
        id: 'aitm-bypasses-mfa',
        type: 'warning',
        title: 'Which MFA Methods AiTM Bypasses',
        summary: 'AiTM defeats most common MFA implementations. Only phishing-resistant MFA is immune.',
        detail:
          'The critical insight: AiTM does not break MFA cryptography. It bypasses MFA entirely by stealing the already-authenticated session. By the time the session cookie is captured, authentication (including MFA) has already completed successfully.',
        items: [
          'BYPASSED: SMS OTP (one-time codes via text) — attacker relays the code in real time',
          'BYPASSED: TOTP apps (Google Authenticator, Authy) — same relay attack',
          'BYPASSED: Email OTP — captured by proxy before reaching victim\'s inbox',
          'BYPASSED: Push notifications (Duo, Microsoft Authenticator) — victim approves the real request',
          'RESISTANT: FIDO2/WebAuthn hardware keys (YubiKey, passkeys) — bound to the legitimate domain; fails on proxy',
          'RESISTANT: Certificate-based authentication (CBA) — cryptographically bound to legitimate domain',
        ],
        example:
          'Microsoft reports that Tycoon 2FA, an AiTM kit, processed over 1,000 phishing domains and targeted more than 3,000 unique email domains in a single campaign wave in 2023.',
        source: 'Microsoft Threat Intelligence — Tycoon 2FA Analysis 2024',
      },
      {
        id: 'aitm-real-world',
        type: 'expandable',
        title: 'Real AiTM Campaigns',
        summary: 'Notable large-scale AiTM attacks that demonstrate the real-world impact.',
        detail:
          'AiTM phishing is no longer a theoretical risk — it is the dominant technique used in BEC fraud and corporate account takeover at scale.',
        items: [
          'Storm-1167 (2023): Microsoft identified a campaign using Evilginx targeting M365 users. After capturing session tokens, attackers created inbox rules to hide their tracks and initiated BEC wire transfers within hours.',
          'Tycoon 2FA (2024): PhaaS platform targeting Microsoft and Google accounts. Operates via Telegram bot interface. Over 1,000 domains active simultaneously. MFA bypass success rate significantly higher than traditional phishing.',
          'Caffeine PhaaS: Sold via open online marketplace (no dark web access required). Includes pre-built M365 kits with AiTM capabilities for $250/month.',
          '0ktapus campaign (2022): Targeted Okta customers; AiTM captured Okta session tokens leading to breaches at Twilio, Cloudflare, and 130+ other organizations.',
        ],
        source: 'Microsoft Digital Defense Report 2024',
      },
    ],
  },
  {
    id: 'emerging',
    title: 'Emerging Phishing Trends',
    icon: 'TrendingUp',
    description:
      'The phishing threat landscape evolves continuously. These are the techniques gaining rapid adoption that security teams must prepare for now.',
    cards: [
      {
        id: 'emerging-quishing',
        type: 'expandable',
        title: 'QR Code Phishing (Quishing) in the Corporate Environment',
        summary: 'QR codes bypass email scanners entirely because they contain no URL — only an image.',
        detail:
          'Quishing embeds a malicious URL inside a QR code image. Email security gateways scan text and URLs, but most cannot interpret QR code images. The user scans the code with their mobile device — which typically lacks corporate security controls, EDR agents, or URL filtering.',
        items: [
          'Parking meter fraud: malicious QR stickers placed over legitimate meter codes',
          'Parcel delivery: fake "reschedule delivery" QR codes on printed cards left at homes',
          'Corporate meetings: fake Microsoft Teams/Zoom meeting room QR codes on physical signage',
          'MFA enrollment phishing: "Scan to enroll in new security system" QR codes in emails',
          'PDF attachments: QR codes embedded in PDFs that pass email content filtering',
          'Business card fraud: QR codes on fake business cards at events',
        ],
        example:
          'In 2023, Microsoft reported a phishing campaign targeting over 10,000 organizations using QR codes that directed victims to fake Microsoft credential pages. All phishing content was image-only — no text URLs for scanners to detect.',
        source: 'Microsoft Security Blog — QR Code Phishing 2023',
      },
      {
        id: 'emerging-mobile',
        type: 'reveal',
        title: 'Mobile-First Attacks',
        summary: 'Mobile devices are increasingly the primary attack surface — with fewer defenses than desktops.',
        detail:
          'Smartphones typically operate outside corporate security perimeters, lack endpoint detection software, and have smaller screens that hide full URLs. Smishing (SMS phishing) has dramatically increased as SMS is perceived as more trustworthy than email. iMessage and RCS provide blue-bubble legitimacy. Mobile banking trojans harvest credentials after a smishing lure installs them.',
        example:
          'Proofpoint found that mobile phishing attempts increased 50% in 2023, with financial services employees being targeted 68% more on mobile than desktop. Average mobile phishing click rate is 3× higher than email phishing click rate.',
        source: 'Proofpoint Mobile Threat Landscape Report 2023',
      },
      {
        id: 'emerging-gen2-bec',
        type: 'expandable',
        title: 'AI-Powered Business Email Compromise (Next-Gen BEC)',
        summary: 'AI makes BEC attacks faster, more convincing, and more scalable than ever before.',
        detail:
          'Traditional BEC required a skilled social engineer who understood corporate culture. AI eliminates this barrier: LLMs trained on an executive\'s email style can produce indistinguishable impersonations. Combined with voice cloning for verification calls, AI-powered BEC represents the highest-value threat to most organizations.',
        items: [
          'AI analyses 6 months of legitimate internal emails to learn communication patterns',
          'Generates emails with correct terminology, project names, and internal jargon',
          'Voice clone used to "confirm" the request when finance team calls back',
          'Timing intelligence: attacks sent during known travel periods when executives are hard to reach',
          'Multi-stage: initial trust-building emails precede the actual fraud request',
          'Average BEC loss per incident: $137,132 (FBI IC3 2023); total annual losses: $2.9 billion',
        ],
        source: 'FBI IC3 Internet Crime Report 2023',
      },
      {
        id: 'emerging-supply-chain',
        type: 'warning',
        title: 'Supply Chain Phishing',
        summary: 'Targeting a company\'s vendors and partners to reach the true target organization.',
        detail:
          'Organizations with strong internal security are often compromised through less-secure third parties. Attackers compromise a trusted vendor\'s email account, then use it to send phishing or fraudulent invoices to the target. The email passes all authentication checks, comes from a known sender, and discusses real ongoing business — making detection extremely difficult.',
        example:
          'The $100 million Facebook and Google BEC fraud (2013–2015) involved fake Quanta Computer invoices sent from a company registered with the same name as their legitimate Taiwanese supplier. All documentation appeared authentic.',
      },
      {
        id: 'emerging-oauth',
        type: 'reveal',
        title: 'OAuth Phishing & Consent Grant Attacks',
        summary: 'Phishing that requests cloud application permissions instead of passwords — persistent access that survives password resets.',
        detail:
          'OAuth phishing (also called "consent phishing" or "illicit consent grant") tricks users into authorizing a malicious third-party application on their Microsoft 365 or Google account. Unlike credential phishing, this access persists even after the victim changes their password — the malicious app retains its permission grant. Microsoft reported a 126% increase in OAuth phishing attacks in 2023.',
        example:
          '"A shared document awaits you. Authorize DocSync Reader to access your Microsoft 365." — The "DocSync Reader" app is malicious. Clicking "Accept" grants it full read access to all emails, files, and contacts — permanently, until an admin revokes it.',
        source: 'Microsoft Threat Intelligence 2023',
      },
    ],
  },
]

export const ADVANCED_THREATS_TAKEAWAYS = [
  'AI-generated phishing has eliminated all the traditional text-based tells — grammar and tone are no longer reliable indicators.',
  'Voice and video deepfakes can convincingly impersonate executives in real time — implement code words and callback verification protocols.',
  'AiTM attacks bypass all common MFA methods by stealing session cookies rather than passwords; only FIDO2/passkeys are resistant.',
  'QR codes bypass email URL scanning — corporate security must include mobile device management and user training on QR risks.',
  'OAuth phishing grants persistent cloud access that survives password resets — requires admin-level revocation.',
  'The most important defense is a culture of healthy skepticism: verify unexpected requests through independent channels, regardless of how legitimate they appear.',
]
