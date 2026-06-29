export interface VoiceScript {
  moduleId: string
  preQuiz: string
  postQuiz: string
}

export const VOICE_SCRIPTS: Record<string, VoiceScript> = {
  introduction: {
    moduleId: 'introduction',
    preQuiz: `Before we test your knowledge, let's recap the core ideas from this module.

Phishing is a social engineering attack where attackers impersonate trusted entities to steal credentials, money, or access. What makes it so dangerous is that it exploits human psychology — not software flaws.

The key psychological triggers used are urgency, fear, authority, greed, and curiosity. When an email tells you your account will be suspended in 24 hours, or your CEO needs a wire transfer immediately, your brain's threat response kicks in and you act before thinking.

The statistics are sobering. Around 91 percent of all cyberattacks begin with a phishing email, and the average breach costs organizations millions of dollars.

Your best defense is recognising these patterns in the moment. Ask yourself: Was this email expected? Does the sender's address match the organisation it claims to be from? Is there unusual urgency? Does any link lead to a different domain when you hover over it?

Take your time with the quiz. Apply the critical-thinking mindset, not the emotional reaction the attacker is trying to trigger.`,
    postQuiz: `Well done completing the quiz.

The core takeaway from this module is that phishing succeeds because it bypasses logic and targets emotion. Urgency, fear, authority — these are the levers attackers pull.

Going forward, your trained response to any unexpected message should be: pause, verify through a separate channel, never click links under pressure. That one habit prevents the majority of phishing attacks.

You have earned your XP for this module. The next module explores the full taxonomy of phishing attacks across email, SMS, voice calls, and beyond.`,
  },

  'types-of-phishing': {
    moduleId: 'types-of-phishing',
    preQuiz: `Let's consolidate what you have learned about the different families of phishing attacks.

Email-based attacks range from broad spray campaigns to highly targeted spear phishing. Spear phishing uses personalised information — your name, role, colleagues, or recent activity — to make the message feel legitimate. Whaling targets executives specifically, because those accounts have the highest privilege and access.

Beyond email, attackers use SMS in smishing attacks, often impersonating delivery companies or banks. They use phone calls in vishing attacks, frequently posing as IT support or government agencies. Quishing uses QR codes to redirect victims to credential-harvesting pages, bypassing link-based email filters.

Credential-based attacks like password spraying and credential stuffing try to reuse leaked passwords across multiple services — which is why unique passwords for every account are critical.

The unifying thread is that all of these attacks work by building false trust. Knowing the categories helps you identify the specific technique being used against you.

Go into the quiz ready to categorise attack scenarios and distinguish between the different phishing vectors.`,
    postQuiz: `Excellent work on the quiz.

The key insight from this module is that phishing is a family of techniques, not a single tactic. Attackers choose their vector based on what will work against a specific target — and they adapt constantly.

Spear phishing will feel personal. Smishing will feel urgent. Vishing will feel official. Your defence is the same in all cases: verify the identity of the requester through a channel you initiated yourself, never the one they gave you.

One more concept to carry forward: if you see a QR code in an unexpected place or communication, treat it with the same suspicion as a link in a phishing email.`,
  },

  'attacker-operations': {
    moduleId: 'attacker-operations',
    preQuiz: `This module covered how attackers research, plan, and execute phishing campaigns. Let's review the key stages.

Attackers begin with Open Source Intelligence, or OSINT, gathering. They mine LinkedIn for organisational hierarchies, search breach databases for existing credentials, and scrape social media for personal details that make their lures convincing.

Infrastructure setup follows: lookalike domains with subtle misspellings or additional words, SSL certificates that give false legitimacy, and email spoofing using misconfigured SPF, DKIM, and DMARC records.

The attack itself often uses urgency and authority together. A phishing kit pre-built for a specific organisation can be deployed in minutes. Many kits include real-time credential relay — your username and password are captured and used within seconds.

Understanding how attackers operate lets you spot the seams in their deception: the slightly wrong domain, the generic greeting, the unusual sender address, the request that doesn't match normal workflow.

The quiz will test your ability to identify these operational tells.`,
    postQuiz: `Good work completing this module's quiz.

The most important takeaway here is that phishing is not opportunistic — it is planned and targeted. Attackers invest significant time in research before sending a single message.

This means your organisation's public information is attack surface. LinkedIn profiles, job postings, press releases, and even out-of-office replies all feed attacker OSINT.

For your own defence: treat any request that deviates from normal procedure as suspicious, regardless of how legitimate it looks. Verify through established channels. And remember — a padlock icon in the address bar only means the connection is encrypted. It says nothing about whether the site is legitimate.`,
  },

  'advanced-threats': {
    moduleId: 'advanced-threats',
    preQuiz: `This module introduced you to the sophisticated end of the phishing threat landscape. Let's review the critical concepts.

Adversary-in-the-Middle attacks, or AiTM, place a transparent proxy between you and the legitimate website. When you complete multi-factor authentication, the attacker's proxy relays your credentials and captures your session cookie in real time. This bypasses SMS OTP, TOTP apps, and push notifications — because the authentication completes successfully, but the session is now stolen.

Business Email Compromise, or BEC, uses either compromised or convincingly spoofed executive email accounts to authorise fraudulent wire transfers or divert payroll. These attacks rarely contain malicious links or attachments — they are pure social engineering, which is why technical filters often miss them.

Phishing kits and Phishing-as-a-Service platforms have industrialised these techniques. Non-technical attackers can now deploy sophisticated campaigns against thousands of targets with minimal effort.

The one MFA method that defeats AiTM is phishing-resistant FIDO2 or WebAuthn — hardware keys or device-bound passkeys — because they are cryptographically bound to the legitimate domain.

Focus on identifying the specific technique in each quiz scenario.`,
    postQuiz: `You have completed the advanced threats module — the most technically demanding section of this course.

The critical takeaway: even multi-factor authentication is not a universal safeguard. AiTM attacks bypass most common MFA implementations. Only hardware security keys and passkeys provide genuine phishing resistance.

For BEC: any financial request arriving by email should be verified through a direct phone call to a number you already have — never the number provided in the email itself.

These attacks succeed because they exploit trust in legitimate-looking communications. Your defence is process, not just technology: always verify unusual requests through an independent channel.`,
  },

  'case-studies': {
    moduleId: 'case-studies',
    preQuiz: `This module presented real-world phishing incidents to ground your learning in documented consequences.

The patterns across major breaches are consistent. The attack often begins with a targeted spear phishing email to one employee. That initial foothold expands through stolen credentials, lateral movement, and privilege escalation. By the time the breach is detected — often weeks or months later — significant data has been exfiltrated.

The Colonial Pipeline attack began with compromised credentials from a dark web leak. The RSA Security breach used a single phishing email with a Flash zero-day to steal SecurID seed values. The Twitter 2020 incident used phone vishing to target internal IT staff with social engineering, not technical exploits.

What these incidents share: the human element was the entry point, regardless of how sophisticated the organisation's technical defences were.

The quiz will ask you to recall specific details about attack methods, timelines, and the lessons each breach taught the industry.`,
    postQuiz: `Case studies are among the most powerful learning tools because they show the real cost of a successful phishing attack.

The lesson across all of them: no organisation is too large, too secure, or too well-staffed to be successfully phished. The attackers are patient, methodical, and they only need to succeed once.

Your role in prevention is to be the employee who recognises the lure, verifies the request, and reports suspicious communications. One person's correct response can stop a breach before it begins.

Carry that sense of personal accountability into the remaining modules.`,
  },

  'defense-best-practices': {
    moduleId: 'defense-best-practices',
    preQuiz: `This final module brings everything together with the concrete defensive practices that protect you and your organisation.

The defensive stack has technical and human layers. Technical controls include email authentication — SPF, DKIM, and DMARC — which when properly configured prevent domain spoofing. Multi-factor authentication adds friction for attackers even when credentials are compromised. Password managers eliminate password reuse. Browser isolation and link sandboxing protect against malicious payloads.

But the human layer matters just as much. URL inspection habits — hovering to check destinations, looking for subtle misspellings, checking for the correct TLD — stop many attacks before they land. Safe attachment handling, understanding which file types are inherently dangerous, and knowing when to call IT rather than click are all skills that save organisations.

Finally, reporting suspicious emails is not optional — it is a responsibility. Your report gives the security team intelligence to protect colleagues who haven't seen the message yet.

The quiz tests your ability to apply these practices to realistic scenarios. Think systematically — layer by layer — not just about one control at a time.`,
    postQuiz: `Congratulations on completing the final module of the PhishGuard course.

Your defence is now layered: you understand the attacker's mindset, the full range of attack vectors, the sophisticated technical methods they use, the real-world consequences of successful attacks, and the controls that prevent them.

The most important habit to keep: verify before you act. That one pause — between seeing a suspicious request and responding to it — is what separates a near-miss from a breach.

Share what you have learned. Security awareness is a network effect — the more people in your organisation who can spot a phishing attempt, the harder it becomes for attackers to find a foothold.

Your certificate of completion is ready. Well done.`,
  },
}
