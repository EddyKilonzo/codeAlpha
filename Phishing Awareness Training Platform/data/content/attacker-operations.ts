export interface LessonCard {
  id: string
  type: 'reveal' | 'expandable' | 'comparison' | 'example' | 'warning' | 'stat' | 'diagram-steps'
  title: string
  summary: string
  detail: string
  example?: string
  items?: string[]
  left?: { label: string; items: string[] }
  right?: { label: string; items: string[] }
  steps?: { step: number; label: string; description: string; icon: string }[]
  source?: string
}

export interface ModuleSection {
  id: string
  title: string
  icon: string
  description: string
  cards: LessonCard[]
}

export const ATTACKER_OPERATIONS_CONTENT: ModuleSection[] = [
  {
    id: 'reconnaissance',
    title: 'Phase 1 — Reconnaissance',
    icon: 'Search',
    description:
      'Before an attacker sends a single email, they spend hours or days gathering intelligence. This phase determines how convincing — and how dangerous — the attack will be.',
    cards: [
      {
        id: 'recon-osint',
        type: 'expandable',
        title: 'Open-Source Intelligence (OSINT)',
        summary: 'Attackers harvest publicly available data before crafting their first email.',
        detail:
          'Attackers use LinkedIn to identify targets, their roles, reporting lines, and recent company news. They scrape company websites for email formats (e.g. first.last@company.com), employee names, and technology stack hints. Twitter, Facebook, and Instagram reveal personal interests used to personalize lures. Press releases announce mergers, product launches, or leadership changes — all perfect pretexts for phishing.',
        example:
          'Real case: Attackers targeting a law firm scraped LinkedIn to identify a partner\'s assistant, then sent an email purportedly from the partner requesting an urgent wire transfer — matching the assistant\'s known responsibilities exactly.',
        items: [
          'LinkedIn: roles, org chart, email patterns, recent hires',
          'Company website: staff pages, press releases, technology hints',
          'Social media: personal interests, travel schedules, family details',
          'Job boards: reveal internal tools (e.g. "must know Salesforce and Office 365")',
          'WHOIS & DNS: domain registration dates, mail servers, SPF records',
          'Data breach dumps: previously leaked credentials from prior incidents',
        ],
      },
      {
        id: 'recon-email-harvesting',
        type: 'reveal',
        title: 'Email Address Harvesting',
        summary: 'Attackers collect and verify real email addresses before launching.',
        detail:
          'Tools like theHarvester, Hunter.io, and Maltego automate the collection of employee email addresses. Once collected, attackers verify which are active using SMTP VRFY commands or by sending low-volume probes. Knowing the exact email format (first.last vs. flast) dramatically increases delivery and response rates.',
        example:
          'A single LinkedIn company page search combined with a known email format (initial + surname) can produce hundreds of verified targets in under 30 minutes using freely available OSINT tools.',
        source: 'SANS Institute — OSINT Framework',
      },
      {
        id: 'recon-pretexting',
        type: 'example',
        title: 'Building the Pretext',
        summary: 'The "story" that makes the phishing email believable.',
        detail:
          'A pretext is a fabricated scenario that justifies the request in the email. The more tailored the pretext, the more effective the attack. Common pretexts include: IT security alerts, payroll updates, invoice disputes, package delivery failures, account lockouts, and CEO/executive requests.',
        example:
          'Attackers monitored a company\'s Twitter account, saw they announced a new HR software rollout, then sent employees a "mandatory password reset" email mimicking the new HR system — days before real IT communications arrived.',
      },
      {
        id: 'recon-timing',
        type: 'stat',
        title: 'Attack Timing Strategy',
        summary: 'Attackers choose send times that exploit human psychology.',
        detail:
          'Research shows phishing emails sent on Tuesday–Thursday mornings between 8–10am achieve the highest open rates, mimicking legitimate business communication patterns. Attacks also surge during major events: tax season, Black Friday, COVID-19 lockdowns, and corporate merger announcements — when people expect unusual communications.',
        source: 'Proofpoint Human Factor Report 2023',
        items: [
          'Tuesday–Thursday: peak business communication window',
          'Monday mornings: high email volume means phishing gets lost in noise',
          'Tax season (Jan–Apr): IRS/HMRC phishing spikes 400%',
          'Black Friday/Cyber Monday: package delivery scams peak',
          'Major news events: COVID, elections, natural disasters used as lures',
        ],
      },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Phase 2 — Attack Infrastructure',
    icon: 'Server',
    description:
      'Attackers build a technical foundation designed to evade detection, bypass spam filters, and impersonate trusted entities.',
    cards: [
      {
        id: 'infra-domains',
        type: 'expandable',
        title: 'Domain Registration & Aging',
        summary: 'Attackers register lookalike domains and "age" them to pass reputation checks.',
        detail:
          'Fresh domains are flagged by spam filters. Attackers register lookalike domains weeks or months in advance and send low-volume legitimate-looking emails to build a clean reputation before launching the attack. Techniques include typosquatting, homograph attacks, and subdomain abuse.',
        items: [
          'Typosquatting: paypa1.com, gooogle.com, micosoft.com',
          'Homograph attacks: using Cyrillic "а" (U+0430) instead of Latin "a" — visually identical',
          'Combosquatting: paypal-secure.com, microsoft-support.net',
          'Subdomain abuse: login.microsoft.com.attacker.net',
          'Expired domain reuse: buying domains with prior clean reputation',
          'TLD confusion: company.net when target expects company.com',
        ],
        example:
          'The 2019 Capital One breach originated from a server misconfiguration, but attackers used aged domains with valid HTTPS certificates to host credential-harvesting pages that browsers showed as "secure."',
      },
      {
        id: 'infra-hosting',
        type: 'reveal',
        title: 'Phishing Kit Hosting',
        summary: 'Pre-built phishing kits let attackers clone any login page in minutes.',
        detail:
          'Phishing-as-a-Service (PhaaS) platforms sell ready-made kits that perfectly replicate Microsoft 365, Google, Dropbox, and banking portals. These kits include anti-bot detection to avoid security researcher scanning, geofencing to only serve the phishing page to targets in specific countries, and redirect chains that make the final malicious page hard to trace.',
        source: 'Microsoft Digital Defense Report 2023',
      },
      {
        id: 'infra-toolkits',
        type: 'expandable',
        title: 'Common Phishing Toolkits',
        summary: 'Professional-grade tools used in real phishing campaigns.',
        detail:
          'These tools are used by both penetration testers and malicious actors. Understanding them helps security teams recognize attack signatures and build better defenses.',
        items: [
          'GoPhish — open-source, popular for pentest simulations; tracks opens, clicks, credentials',
          'Evilginx2 — adversary-in-the-middle framework that bypasses MFA by proxying sessions',
          'Modlishka — reverse proxy that captures real-time credentials and session tokens',
          'SET (Social Engineering Toolkit) — suite covering phishing, credential harvesting, payload delivery',
          'EvilnoVNC — phishing via noVNC browser-in-browser technique, bypasses bot detection',
          'Caffeine — PhaaS platform sold on dark web, includes Microsoft 365 kits',
          'Tycoon 2FA — advanced PhaaS kit targeting Microsoft and Google 2FA',
          'Greatness — PhaaS specializing in Microsoft 365 with real-time CAPTCHA bypass',
        ],
        example:
          'Evilginx2 works by acting as a reverse proxy between the victim and the legitimate login page. The victim sees and interacts with the real Microsoft 365 login — including their real MFA prompt — but Evilginx captures the authenticated session cookie, bypassing MFA entirely.',
      },
      {
        id: 'infra-certificates',
        type: 'warning',
        title: 'HTTPS ≠ Safe',
        summary: 'A padlock icon does NOT mean a site is legitimate.',
        detail:
          'Over 83% of phishing sites now use HTTPS with valid SSL/TLS certificates (APWG Q3 2023). Attackers obtain free certificates from Let\'s Encrypt in minutes. The padlock only confirms the connection is encrypted — it says nothing about whether the site owner is trustworthy. Many users were trained to "look for the padlock" — this advice is now dangerously outdated.',
        example:
          '"Secure" https://login.micros0ft-account.com is still a phishing site. The certificate is real; the domain is fake.',
        source: 'APWG Phishing Trends Report Q3 2023',
      },
    ],
  },
  {
    id: 'spoofing',
    title: 'Phase 3 — Domain Spoofing & Email Deception',
    icon: 'Mail',
    description:
      'Attackers manipulate email headers, sender addresses, and domains to make malicious messages appear to originate from trusted sources.',
    cards: [
      {
        id: 'spoof-display-name',
        type: 'comparison',
        title: 'Display Name Spoofing vs. Domain Spoofing',
        summary: 'Two different techniques with different bypass rates.',
        detail:
          'Display name spoofing is the simplest technique — the attacker sets the visible "From" name to something trusted while the actual email address is completely different. Domain spoofing is more sophisticated: the attacker uses a domain that looks identical or very similar to the real one.',
        left: {
          label: 'Display Name Spoof (Simple)',
          items: [
            'From: "Microsoft Security" <attacker@gmail.com>',
            'Visible name looks legitimate',
            'Actual domain is unrelated',
            'Easy for mail clients to detect',
            'Often caught by spam filters',
          ],
        },
        right: {
          label: 'Domain Spoof (Advanced)',
          items: [
            'From: admin@micros0ft.com',
            'Domain looks nearly identical',
            'Passes visual inspection',
            'May pass basic spam filters',
            'Requires DMARC to block',
          ],
        },
      },
      {
        id: 'spoof-dkim-spf',
        type: 'expandable',
        title: 'SPF, DKIM & DMARC — The Email Authentication Stack',
        summary: 'The three DNS-based defenses against email spoofing — and how attackers bypass them.',
        detail:
          'SPF (Sender Policy Framework) lists which servers are authorized to send email for a domain. DKIM (DomainKeys Identified Mail) adds a cryptographic signature to emails. DMARC tells receiving servers what to do when SPF or DKIM checks fail (quarantine, reject, or none). When all three are correctly configured, spoofed emails from a domain are blocked. However, many organizations still use DMARC in "p=none" (monitor-only) mode, providing zero enforcement.',
        items: [
          'SPF bypass: attackers send from sub-domains or third-party services not in the SPF record',
          'DKIM bypass: domains without DKIM allow unsigned emails to pass',
          'DMARC "p=none": common misconfiguration that monitors but never blocks',
          'Lookalike domains: attacker\'s own domain has valid SPF/DKIM/DMARC — it\'s not "spoofed"',
          'Header injection: From: header differs from Envelope-From, confusing mail clients',
          'Reply-to hijack: legitimate From address, but Reply-to points to attacker',
        ],
        example:
          '94% of Fortune 500 companies have published DMARC records, but fewer than 50% enforce rejection — meaning half are not blocking spoofed emails from their own domains. (Valimail DMARC Monitor 2023)',
      },
      {
        id: 'spoof-homograph',
        type: 'reveal',
        title: 'Homograph & Unicode Attacks',
        summary: 'Characters that look identical to the human eye but are different in code.',
        detail:
          'Unicode allows characters from many languages that are visually indistinguishable from Latin characters. The Cyrillic lowercase "а" (U+0430) looks exactly like the Latin "a" (U+0061). Similarly, "о" (Cyrillic), "0" (zero), and "O" (capital o) are often confused. Attackers use Punycode-encoded internationalized domain names (IDNs) to register these lookalike domains.',
        example:
          'аpple.com registered with Cyrillic "а" renders identically to apple.com in most browsers. Both display as "apple.com" — only the URL encoding reveals the difference: xn--pple-43d.com.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Phase 4 — Email Delivery & Evasion',
    icon: 'Send',
    description:
      'Getting a malicious email past spam filters and into the inbox requires increasingly sophisticated evasion techniques.',
    cards: [
      {
        id: 'delivery-evasion',
        type: 'expandable',
        title: 'Spam Filter Evasion Techniques',
        summary: 'How attackers bypass modern email security gateways.',
        detail:
          'Email security gateways (SEGs) like Proofpoint, Mimecast, and Microsoft Defender scan incoming emails for malicious content. Attackers have developed numerous techniques to evade these systems.',
        items: [
          'URL redirects: link first points to a clean page, then redirects post-click',
          'Delayed payload activation: malicious content activates hours after delivery when scanners have moved on',
          'QR code embedding: scanners can\'t follow QR codes; user\'s phone has no corporate security tools',
          'HTML obfuscation: CSS and invisible characters break up keywords like "password" or "click here"',
          'Image-based phishing: all text rendered as an image, nothing for scanners to analyze',
          'Password-protected attachments: scanner cannot open the attachment; user sees content',
          'CAPTCHA on landing page: bots can\'t solve it; real user sees phishing page',
          'Legitimate cloud hosting: phishing page hosted on Google Drive, SharePoint, or OneDrive',
          'Zero-font technique: hidden keywords in white text satisfy content filters',
        ],
        example:
          'In 2023, attackers hosted phishing pages on Google Sites — a legitimate Google domain. Corporate firewalls allowed all Google traffic through, and sandbox scanners that visited the link saw only a legitimate Google domain.',
      },
      {
        id: 'delivery-legitimate-services',
        type: 'warning',
        title: 'Abusing Legitimate Services',
        summary: 'Attackers embed malicious links inside trusted platforms to bypass filters.',
        detail:
          'When an email contains a SharePoint.com link, Microsoft Teams message, or Google Drive URL, most security tools allow it through automatically. Attackers exploit this trust by: storing payloads in OneDrive/SharePoint, sending DocuSign invitations linking to fake documents, using Google Forms to harvest credentials, creating Dropbox shared links pointing to phishing pages, and sending via compromised legitimate email accounts.',
        example:
          'In the 2022 Uber breach, attackers used WhatsApp to send social engineering messages — completely bypassing corporate email security tools.',
        source: 'Cloudflare Phishing Threats Report 2023',
      },
      {
        id: 'delivery-compromised-accounts',
        type: 'reveal',
        title: 'Compromised Account Pivoting',
        summary: 'Sending phishing from already-hacked legitimate accounts is nearly impossible to detect.',
        detail:
          'Once an attacker compromises one account, they use it to send phishing emails to that user\'s entire contact list. These emails pass all authentication checks (SPF, DKIM, DMARC) because they genuinely come from the legitimate account. The recipient recognizes the sender, trusts the name, and is far more likely to click. This is how Business Email Compromise chains develop across organizations.',
        source: 'FBI IC3 Internet Crime Report 2023',
      },
    ],
  },
  {
    id: 'harvesting',
    title: 'Phase 5 — Credential Harvesting',
    icon: 'Database',
    description:
      'The final goal of most phishing attacks: capturing usernames, passwords, session tokens, and MFA codes.',
    cards: [
      {
        id: 'harvest-fake-pages',
        type: 'diagram-steps',
        title: 'The Credential Harvesting Flow',
        summary: 'Step-by-step: how attackers capture and use stolen credentials.',
        detail: 'Modern phishing harvesting is highly automated and often real-time.',
        steps: [
          {
            step: 1,
            label: 'Victim clicks link',
            description: 'Redirected through one or more relay domains to obscure the final destination.',
            icon: 'MousePointer',
          },
          {
            step: 2,
            label: 'CAPTCHA / human check',
            description: 'Filters out automated scanners; real users see the phishing page.',
            icon: 'Shield',
          },
          {
            step: 3,
            label: 'Credential entry',
            description: 'Victim enters username and password on the cloned page.',
            icon: 'KeyRound',
          },
          {
            step: 4,
            label: 'Real-time relay (AiTM)',
            description: 'Credentials forwarded to legitimate site; session token captured.',
            icon: 'ArrowLeftRight',
          },
          {
            step: 5,
            label: 'MFA intercept',
            description: 'Victim receives and enters their real MFA code; attacker captures it.',
            icon: 'Smartphone',
          },
          {
            step: 6,
            label: 'Session hijack',
            description: 'Attacker uses captured session cookie to access account without needing password or MFA again.',
            icon: 'Cookie',
          },
        ],
      },
      {
        id: 'harvest-types',
        type: 'expandable',
        title: 'What Gets Stolen',
        summary: 'Attackers target different data depending on their end goal.',
        detail:
          'Credential harvesting is rarely the final step. Stolen credentials become the entry point for broader attacks — lateral movement, BEC fraud, ransomware deployment, or data exfiltration.',
        items: [
          'Username + password: used directly or sold on dark web markets ($5–$200 depending on account type)',
          'Session cookies: allow account access without password — bypass MFA completely',
          'MFA codes (TOTP): captured in real-time via AiTM proxy; single-use so must be used instantly',
          'API tokens & OAuth tokens: used for persistent access to cloud services',
          'Recovery codes: one-time backup codes that permanently disable MFA',
          'Corporate VPN credentials: sold as "initial access" to ransomware groups',
          'Banking credentials: OTPs captured via SMS interception or AiTM',
        ],
        source: 'IBM X-Force Threat Intelligence Index 2024',
      },
      {
        id: 'harvest-dark-web',
        type: 'stat',
        title: 'Credential Markets',
        summary: 'Stolen credentials are monetized quickly through dark web markets.',
        detail:
          'Most stolen credentials are sold within 24 hours of capture. Prices vary dramatically by account type and perceived value. Corporate email credentials with admin access command the highest prices and are often purchased directly by ransomware-as-a-service affiliates seeking "initial access."',
        items: [
          'Netflix/streaming accounts: $2–$10',
          'Personal email accounts: $15–$40',
          'Online banking (under $2,000 balance): $40–$200',
          'Corporate Microsoft 365 account: $100–$500',
          'Corporate admin access / VPN credentials: $500–$15,000',
          'Fortune 500 network access: $100,000+',
        ],
        source: 'Digital Shadows Credential Exposure Report 2023',
      },
    ],
  },
]

export const ATTACKER_OPERATIONS_TAKEAWAYS = [
  'Attackers invest significant time in reconnaissance before sending a single email — the more targeted, the more dangerous.',
  'Phishing infrastructure (domains, hosting, certificates) is built weeks in advance to build reputation and evade filters.',
  'HTTPS/padlock does not indicate a safe site — over 83% of phishing sites use valid SSL certificates.',
  'SPF, DKIM, and DMARC are critical defenses, but only effective when all three are deployed and enforced.',
  'Evilginx-style AiTM attacks can bypass most MFA implementations by capturing session cookies in real time.',
  'Compromised accounts are the most dangerous senders — they pass all authentication checks and are trusted by recipients.',
]
