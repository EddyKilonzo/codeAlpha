import type { LessonCard, ModuleSection } from './attacker-operations'

export const DEFENSE_CONTENT: ModuleSection[] = [
  {
    id: 'spot-phishing',
    title: 'How to Spot a Phishing Email',
    icon: 'Eye',
    description:
      'Before any technical defense, the first line of protection is a trained human eye. These are the specific signals that consistently appear in phishing emails — learn to check them systematically.',
    cards: [
      {
        id: 'spot-sender',
        type: 'expandable',
        title: 'Inspect the Sender Address (Not Just the Name)',
        summary: 'The display name can say anything. Always check the actual email address domain.',
        detail:
          'Email clients show a "friendly name" by default. Click or hover on the sender name to reveal the real address. Verify: Does the domain match the organization exactly? Is it a lookalike (paypa1.com, micros0ft.com)? Does the domain make sense for the type of email sent? A shipping notification should come from @dhl.com, not @dhl-parcels-tracking.net.',
        items: [
          'Hover over sender name to reveal real email address in most clients',
          'Check the domain — everything after the @ symbol',
          'Beware lookalike domains: paypal-security.net, support-microsoft.com',
          'Subdomains can be misleading: microsoft.com.malicious.net — the real domain is malicious.net',
          'Free email providers (gmail, yahoo, hotmail) should never send business alerts',
          'Internal company emails should come from @yourcompany.com — never external domains',
        ],
        example:
          '"From: Microsoft Support <alert@microsoft-online-security.com>" — microsoft-online-security.com is NOT Microsoft. The word "Microsoft" appears but the domain is completely different.',
      },
      {
        id: 'spot-urgency',
        type: 'warning',
        title: 'The Urgency & Fear Trap',
        summary: 'Urgency is the attacker\'s most powerful tool. Slow down when pressure is highest.',
        detail:
          'Phishing emails are engineered to bypass rational thinking by triggering emotional responses — fear, urgency, greed, or curiosity. The more urgent an email feels, the more carefully you should examine it. Legitimate organizations accept a few hours of delay for security verification. Attackers cannot.',
        items: [
          '"Your account will be suspended in 24 hours" — creates panic',
          '"Immediate action required" — bypasses careful thinking',
          '"You have been selected for a refund" — exploits greed',
          '"Unusual sign-in activity detected" — triggers fear',
          '"Confidential: Do not forward" — creates artificial exclusivity',
          '"Your package could not be delivered" — exploits expectation',
        ],
        example:
          'Pause for 30 seconds. Ask yourself: If this is genuine, what\'s the worst that happens if I wait 30 minutes and verify through the official website or app? The answer is almost always "nothing."',
      },
      {
        id: 'spot-links',
        type: 'reveal',
        title: 'How to Inspect Links Without Clicking',
        summary: 'Hover to preview. The displayed text and the actual URL are often completely different.',
        detail:
          'In email clients and browsers, hovering over a link without clicking reveals the actual destination URL in the status bar. The displayed link text ("Click here to verify your account") is meaningless — only the URL in the status bar matters. On mobile, hold down on the link to preview the URL before opening. Red flags: URL doesn\'t match the expected domain, URL uses HTTP not HTTPS, URL contains random strings, URL goes to a well-known platform (bit.ly, Google Drive) when you expect a company website.',
        items: [
          'Desktop: hover over link → check bottom-left status bar for actual URL',
          'Mobile: long-press the link → preview URL in pop-up before tapping',
          'Copy link and paste into a text editor to inspect without visiting',
          'URL shorteners (bit.ly, tinyurl) hide destinations — use unshorten.me to preview',
          'Check that the domain name is correct: the TLD (last part) is what matters, not the prefix',
        ],
        example:
          '"Click here to verify: https://paypal.com.account-security-verify.net/login" — the real domain is account-security-verify.net, not paypal.com.',
      },
      {
        id: 'spot-attachments',
        type: 'expandable',
        title: 'Dangerous Attachment Types',
        summary: 'Know which file types carry the highest risk and how to handle them.',
        detail:
          'Not all attachments are equal. Some file types are inherently more dangerous because they can execute code. When unexpected attachments arrive — even from known senders — verify via a separate communication channel before opening.',
        items: [
          'WARNING: .exe, .bat, .cmd, .vbs, .ps1 — executable files; should never be emailed legitimately',
          'WARNING: .js, .jse, .wsf — JavaScript files that run on Windows',
          'WARNING: Office files with macros (.xlsm, .docm, .pptm) — "Enable macros" prompt = red flag',
          'WARNING: Password-protected ZIPs/7z — used to bypass email scanners',
          'WARNING: .iso, .img — disk images that can bypass Windows mark-of-the-web protections',
          'WARNING: .html, .htm attachments — can contain inline credential-harvesting forms',
          'PDF (with caution) — generally safer but can contain malicious links',
          'Plain image files (.jpg, .png, .gif) from known senders are usually safe',
        ],
        example:
          'A Word document received unexpectedly asking you to "Enable Editing" then "Enable Macros" is a classic malware delivery mechanism. Never enable macros in unexpected Office documents.',
      },
      {
        id: 'spot-headers',
        type: 'expandable',
        title: 'Reading Email Headers for Advanced Users',
        summary: 'Email headers contain technical authentication data that reveals spoofing attempts.',
        detail:
          'Every email contains hidden headers with routing and authentication information. In most clients: More options → View raw message / Show original. Look for SPF, DKIM, and DMARC authentication results in the "Authentication-Results" header.',
        items: [
          'Authentication-Results: spf=pass — sender server authorized to send for this domain',
          'Authentication-Results: dkim=fail — message may have been tampered with in transit',
          'Authentication-Results: dmarc=fail — neither SPF nor DKIM passed for this domain',
          'Received: headers show the mail server chain — unusual routing is a red flag',
          'Reply-To: header different from From: — responses will go to a different address',
          'X-Originating-IP: can reveal the actual sending server\'s location',
        ],
        source: 'SANS Institute — Email Header Analysis Guide',
      },
    ],
  },
  {
    id: 'url-inspection',
    title: 'URL Inspection Techniques',
    icon: 'Link',
    description:
      'URLs contain all the information you need to identify a fake website — if you know what to look for. These techniques work before you submit any information.',
    cards: [
      {
        id: 'url-anatomy',
        type: 'diagram-steps',
        title: 'Anatomy of a URL',
        summary: 'Breaking down every part of a URL to identify malicious patterns.',
        detail: 'Every URL follows the same structure. Each part can be faked or manipulated.',
        steps: [
          {
            step: 1,
            label: 'Protocol',
            description: 'https:// — always look for HTTPS, but remember HTTPS does not mean safe, only encrypted.',
            icon: 'Lock',
          },
          {
            step: 2,
            label: 'Subdomain',
            description: 'login. or secure. — can be anything; attackers add "secure", "login", "verify" to appear legitimate.',
            icon: 'Globe',
          },
          {
            step: 3,
            label: 'Domain name',
            description: 'paypal — this is what you need to verify. Lookalikes: paypa1, paypaI (capital i), paypal-secure.',
            icon: 'Building',
          },
          {
            step: 4,
            label: 'TLD (Top-Level Domain)',
            description: '.com — paired with the domain name, this is the definitive identifier. .com.br or .com.phishing.net means the domain is NOT .com.',
            icon: 'Tag',
          },
          {
            step: 5,
            label: 'Path',
            description: '/login/verify — can say anything, including /paypal/microsoft/apple; only the domain matters.',
            icon: 'Folder',
          },
          {
            step: 6,
            label: 'Query string',
            description: '?token=abc123 — often used to track which victim clicked; long random strings are common in phishing.',
            icon: 'Hash',
          },
        ],
      },
      {
        id: 'url-tools',
        type: 'expandable',
        title: 'Free URL Inspection Tools',
        summary: 'Before visiting any suspicious link, use these tools to check its reputation and destination.',
        detail:
          'These tools are free, require no account, and take under 30 seconds. Bookmark them. Use them any time you receive an unexpected link.',
        items: [
          'VirusTotal (virustotal.com/gui/url) — scans URL against 90+ security vendors simultaneously',
          'URLScan.io — takes a screenshot of the URL and shows full request chain without you visiting',
          'Google Safe Browsing (transparencyreport.google.com/safe-browsing/search) — Google\'s URL reputation database',
          'Unshorten.me — expands shortened URLs (bit.ly, tinyurl) to reveal the true destination',
          'PhishTank (phishtank.com) — community-sourced database of confirmed phishing URLs',
          'CheckPhish (checkphish.ai) — AI-powered phishing site detector with visual comparison',
        ],
        example:
          'Received a suspicious link? Paste it into urlscan.io — you\'ll see a screenshot of what the page looks like, all network requests it makes, and whether any security vendors have flagged it — without ever visiting the page yourself.',
      },
      {
        id: 'url-browser',
        type: 'comparison',
        title: 'Legitimate vs. Phishing URL Patterns',
        summary: 'Common URL patterns that distinguish genuine from fraudulent sites.',
        detail: 'Side-by-side examples of real vs. fake URLs for the same brand.',
        left: {
          label: 'Legitimate URLs',
          items: [
            'https://www.paypal.com/signin',
            'https://account.microsoft.com/security',
            'https://myaccount.google.com',
            'https://www.chase.com/digital/login',
            'https://dhl.com/en/tracking.html',
          ],
        },
        right: {
          label: 'Phishing URLs',
          items: [
            'https://paypal-secure-login.com/signin',
            'https://microsoft.com.security-verify.net',
            'https://googie-accounts.com/login',
            'https://chase-fraud-alert.com/verify',
            'https://dhl-tracking-parcel.com/en/tracking',
          ],
        },
      },
    ],
  },
  {
    id: 'mfa-best-practices',
    title: 'MFA Best Practices',
    icon: 'ShieldCheck',
    description:
      'Multi-factor authentication is the single most effective control against credential-based attacks — but not all MFA is equal. Understanding the difference between weak and strong MFA is critical.',
    cards: [
      {
        id: 'mfa-hierarchy',
        type: 'expandable',
        title: 'MFA Strength Hierarchy',
        summary: 'MFA methods range from easily bypassed to completely phishing-resistant.',
        detail:
          'The weakest MFA is still far better than no MFA. But attackers have adapted — SMS OTPs and TOTP codes can both be intercepted via AiTM attacks. True phishing resistance requires cryptographic binding to the legitimate domain.',
        items: [
          'WEAKEST: SMS OTP — vulnerable to SIM swapping, SS7 attacks, and AiTM relay',
          'WEAK: Email OTP — same relay vulnerability as SMS; attacker may also have email access',
          'MODERATE: TOTP apps (Google Authenticator, Authy) — better than SMS but bypassed by AiTM',
          'MODERATE: Push notifications (Duo, Microsoft Authenticator) — vulnerable to MFA fatigue and AiTM',
          'STRONG: Push with number matching — requires typing a number from the screen; harder to fatigue',
          'STRONG: Push with additional context — shows IP location and app name; more informed decision',
          'PHISHING-RESISTANT: FIDO2 hardware keys (YubiKey, Titan) — cryptographically bound to domain',
          'PHISHING-RESISTANT: Passkeys (device-bound) — same cryptographic binding; can\'t be relayed',
          'PHISHING-RESISTANT: Certificate-based authentication (CBA) — mutual TLS with client certificates',
        ],
        source: 'NIST SP 800-63B Authentication Guidelines',
      },
      {
        id: 'mfa-fatigue',
        type: 'warning',
        title: 'Defending Against MFA Fatigue',
        summary: 'Attackers send repeated push notification requests until the exhausted user approves.',
        detail:
          'MFA push fatigue (also called MFA bombing) works by flooding a user with authentication requests — often at 2am or during a busy workday — until they approve one out of confusion, frustration, or just to make it stop. Microsoft reported 382,000 MFA fatigue attacks in 2022.',
        items: [
          'Never approve an MFA prompt you did not initiate — always deny unexpected requests',
          'If you receive unexpected MFA prompts, assume your password is compromised and change it immediately',
          'Report unexpected MFA prompts to your IT security team immediately',
          'Enable "number matching" on Microsoft Authenticator or Duo — requires typing a code shown on the login screen',
          'Request your organization upgrade to FIDO2 or passkeys to eliminate push-based MFA entirely',
          'If MFA bombing happens at unusual hours: turn off the phone, notify IT in the morning',
        ],
        example:
          'Uber\'s 2022 breach began with MFA fatigue: the attacker texted the employee claiming to be from "Uber IT" and explaining why the push notifications were occurring — the employee approved the next request.',
      },
      {
        id: 'mfa-recovery',
        type: 'reveal',
        title: 'Protect Your Recovery Codes',
        summary: 'Recovery codes bypass all MFA — treat them like a master key.',
        detail:
          'When you set up MFA on any account, you\'re given one-time recovery codes in case you lose access to your authenticator. These codes bypass all MFA completely. Attackers target recovery codes specifically in phishing — "Your recovery codes have been changed, click to view your new codes." Store your recovery codes in a password manager or printed in a physically secure location — never in email or cloud documents.',
        example:
          'If an attacker obtains your recovery codes, changing your password is insufficient — they can use a code to log in and disable or change your MFA to their own device. Recovery code theft effectively results in permanent account takeover.',
      },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting Phishing in Enterprise Environments',
    icon: 'Flag',
    description:
      'Reporting phishing is not just self-protection — it protects every colleague who might receive the same email minutes later. Speed of reporting determines how many people get compromised.',
    cards: [
      {
        id: 'reporting-why',
        type: 'stat',
        title: 'Why Reporting Matters',
        summary: 'Each phishing report creates intelligence that protects the entire organization.',
        detail:
          'When one employee reports a phishing email, the security team can block the sending domain, pull the email from all inboxes organization-wide, and brief other staff before they become victims. The faster the report, the more people are protected. KnowBe4 research shows organizations with active reporting programs reduce their susceptibility rate by up to 80%.',
        items: [
          'Average time for a phishing email to reach its first victim click: 82 seconds (Verizon DBIR)',
          'Average time for security teams to act on a reported phishing email: 17 minutes',
          'Organizations with reporting culture: 80% lower susceptibility (KnowBe4)',
          'Email pulled from all inboxes organization-wide when reported via security tools',
          'Each report improves email filtering rules for the entire organization',
          'Reporting protects colleagues who may be less security-aware',
        ],
        source: 'Verizon DBIR 2023 / KnowBe4 Phishing By Industry Report 2023',
      },
      {
        id: 'reporting-how',
        type: 'diagram-steps',
        title: 'How to Report Phishing (Step by Step)',
        summary: 'The correct reporting procedure preserves evidence and protects your colleagues.',
        detail: 'Do not forward phishing emails to colleagues as a warning — use official reporting channels.',
        steps: [
          {
            step: 1,
            label: 'Do not click anything',
            description: 'If you suspect an email is phishing, stop. Do not click links, download attachments, or reply.',
            icon: 'MousePointerOff',
          },
          {
            step: 2,
            label: 'Do not forward to colleagues',
            description: 'Forwarding spreads the threat. Your well-meaning warning email becomes another phishing delivery.',
            icon: 'Ban',
          },
          {
            step: 3,
            label: 'Use the report phishing button',
            description: 'Most corporate email clients have a "Report Phishing" or "Report Suspicious" button added by IT. Use it — it sends the email with full headers to the security team.',
            icon: 'Flag',
          },
          {
            step: 4,
            label: 'Report to IT Security directly',
            description: 'If no button exists, forward the email as an attachment (not inline) to your security team\'s dedicated phishing inbox.',
            icon: 'Mail',
          },
          {
            step: 5,
            label: 'Report externally if needed',
            description: 'For phishing impersonating a brand: report to reportphishing@apwg.org, the FTC (reportfraud.ftc.gov), or the impersonated company\'s abuse address.',
            icon: 'Send',
          },
          {
            step: 6,
            label: 'If you already clicked',
            description: 'Notify IT Security immediately. Change your password from a different device. Disconnect from the network if malware may have been downloaded.',
            icon: 'AlertTriangle',
          },
        ],
      },
      {
        id: 'reporting-tools',
        type: 'expandable',
        title: 'Enterprise Reporting Tools',
        summary: 'Tools your organization can deploy to enable one-click phishing reporting.',
        detail:
          'These tools integrate with major email platforms to add a visible "Report Phishing" button that sends the full email with headers to the security operations team, triggers automated analysis, and removes the email from all mailboxes if confirmed malicious.',
        items: [
          'Microsoft Report Message add-in — built-in for Microsoft 365; reports to Microsoft and your SOC',
          'KnowBe4 Phish Alert Button (PAB) — one-click reporting; integrates with security awareness platform',
          'Cofense Reporter — enterprise reporting with real-time threat intelligence integration',
          'Proofpoint Report Suspicious add-in — integrates with Proofpoint email security gateway',
          'Google Gmail "Report phishing" — built into Gmail; reports to Google and optionally your Workspace admin',
          'Outlook right-click menu — "Report Junk > Phishing" available in Outlook web and desktop',
        ],
      },
    ],
  },
  {
    id: 'security-tools',
    title: 'Security Tools & Technical Defenses',
    icon: 'Wrench',
    description:
      'Technical controls create multiple layers of defense. No single tool is sufficient — effective protection stacks these controls to catch attacks at every stage.',
    cards: [
      {
        id: 'tools-email-gateway',
        type: 'expandable',
        title: 'Email Security Gateways (SEG)',
        summary: 'Enterprise email filtering that blocks the majority of phishing before it reaches users.',
        detail:
          'Secure Email Gateways scan all inbound and outbound email for malicious content, links, attachments, and sender reputation — before the email reaches the user\'s inbox. Leading platforms include Proofpoint, Mimecast, Microsoft Defender for Office 365, Cisco Secure Email, and Barracuda. They provide URL rewriting (safe links), attachment sandboxing, and sender reputation scoring.',
        items: [
          'URL rewriting: every link replaced with a proxy URL that scans the destination at click time',
          'Attachment sandboxing: files executed in an isolated environment before delivery',
          'Sender reputation scoring: new/unknown domains quarantined automatically',
          'Impersonation detection: AI models learn normal communication patterns; flags anomalies',
          'BEC detection: flags emails matching wire transfer or payroll change patterns',
          'Outbound scanning: prevents compromised internal accounts from sending phishing to contacts',
        ],
        source: 'Gartner Magic Quadrant for Enterprise Email Security 2023',
      },
      {
        id: 'tools-dns-filtering',
        type: 'reveal',
        title: 'DNS Filtering',
        summary: 'Block malicious domains at the network level — before any content is downloaded.',
        detail:
          'DNS filtering intercepts domain lookups and blocks connections to known malicious domains before any content is downloaded to the device. Because it operates at the DNS layer, it protects all devices on the network regardless of application — covering browsers, email clients, and apps simultaneously. Leading solutions: Cisco Umbrella, Cloudflare Gateway, NextDNS, Pi-hole (home use). Particularly effective for blocking newly registered phishing domains and command-and-control (C2) infrastructure.',
        example:
          'An employee clicks a phishing link. Before the browser can load the page, their DNS resolver checks the domain against threat intelligence feeds. The domain matches a known phishing host → connection blocked → browser shows "Site blocked by your security policy."',
        source: 'Cisco Security Outcomes Study 2023',
      },
      {
        id: 'tools-browser',
        type: 'expandable',
        title: 'Browser Extensions & Safe Browsing',
        summary: 'Last-line defenses that warn users even when emails and DNS filtering miss a threat.',
        detail:
          'Browser-level protections provide a final interception layer at the point where a user actually visits a phishing page. Both Google Safe Browsing (built into Chrome, Firefox, Safari) and Microsoft Defender SmartScreen (Edge) maintain lists of known phishing and malware sites, displaying a red warning page before the site loads.',
        items: [
          'Google Safe Browsing: protects 5 billion devices, blocks 3 million phishing page loads per week',
          'Microsoft Defender SmartScreen: integrated in Edge; extends to downloaded files',
          'uBlock Origin: open-source content blocker; blocks malicious domains and ad-based malware delivery',
          'Web of Trust (WOT): community reputation scores for websites',
          'Netcraft Extension: detects phishing sites and shows server hosting details',
          'Password manager autofill protection: most password managers only autofill on the exact legitimate domain — they won\'t fill credentials on paypal-secure.com when your saved entry is paypal.com',
        ],
        example:
          'Password manager domain binding is an accidental but powerful phishing defense: if you use a password manager and it doesn\'t offer to autofill your credentials on the page you\'re visiting, that\'s a strong signal you\'re on a fake site.',
      },
      {
        id: 'tools-endpoint',
        type: 'expandable',
        title: 'Endpoint Detection & Response (EDR)',
        summary: 'Catch malware that lands despite all email and network defenses.',
        detail:
          'When a phishing email delivers a malicious attachment that passes all filters, EDR is the safety net. Modern EDR platforms (CrowdStrike Falcon, Microsoft Defender for Endpoint, SentinelOne, Carbon Black) monitor all process activity on endpoints in real time — detecting suspicious behaviors like Office applications spawning command shells, unusual network connections, or file encryption patterns (ransomware precursor).',
        items: [
          'Behavioral detection: catches new malware variants by behavior, not just known signatures',
          'Office macro monitoring: alerts when Word/Excel spawns unexpected child processes',
          'Network telemetry: detects unexpected outbound connections from endpoints',
          'Memory protection: detects shellcode injection and fileless malware techniques',
          'Automated containment: can isolate a compromised endpoint from the network automatically',
          'Threat hunting: allows SOC analysts to search for indicators of compromise across the entire fleet',
        ],
        source: 'CrowdStrike Global Threat Report 2024',
      },
    ],
  },
  {
    id: 'org-defenses',
    title: 'Organisational Defenses',
    icon: 'Building',
    description:
      'Technical tools catch attacks in progress. Organizational defenses prevent attacks from succeeding in the first place by building a security-aware culture and process controls.',
    cards: [
      {
        id: 'org-training',
        type: 'expandable',
        title: 'Security Awareness Training Programs',
        summary: 'Structured, ongoing training is 4× more effective than one-time annual sessions.',
        detail:
          'Effective security awareness training is not a once-a-year checkbox exercise. Research consistently shows that brief, frequent, engaging training — especially training triggered immediately after a near-miss — produces lasting behavior change. KnowBe4 research shows organizations that complete quarterly training reduce click rates on simulated phishing from an average of 32% to under 5% within 12 months.',
        items: [
          'Frequency matters: monthly micro-training beats annual all-day sessions',
          'Personalization: training triggered by actual phishing attempts targeting your industry',
          'Just-in-time learning: immediate training module when user fails a phishing simulation',
          'Role-based training: finance teams get BEC-focused training; executives get whaling scenarios',
          'Positive reinforcement: reward correct reporting; avoid punishing test failures',
          'Metrics: track click rate, report rate, and time-to-report as KPIs over time',
        ],
        source: 'KnowBe4 Phishing By Industry Benchmarking Report 2023',
      },
      {
        id: 'org-simulation',
        type: 'reveal',
        title: 'Simulated Phishing Programs',
        summary: 'Real-world practice through safe, controlled phishing simulations is the most effective training.',
        detail:
          'Simulated phishing sends realistic (but harmless) phishing emails to employees, measures who clicks, and immediately provides targeted training to those who do. Unlike watching a training video, simulations create memorable experiences — the embarrassment of falling for a fake phishing email drives lasting behavior change. CISA and NIST both recommend regular simulated phishing as a core control.',
        example:
          'A law firm ran quarterly simulations: initial click rate was 28%. After 12 months of simulation + micro-training, click rate dropped to 3.2% and report rate increased from 2% to 67% — meaning nearly 7 in 10 employees now report suspicious emails rather than ignoring or clicking them.',
        source: 'CISA — Phishing Guidance 2023',
      },
      {
        id: 'org-processes',
        type: 'expandable',
        title: 'Process Controls That Prevent Fraud',
        summary: 'Policies and procedures that eliminate the attack surface even if phishing succeeds.',
        detail:
          'Technical controls catch most attacks. Process controls are what protect you when the technical controls fail. These procedural policies make it impossible to complete fraud even when an attacker has compromised an account or convinced an employee.',
        items: [
          'Dual-control for wire transfers: no single person can authorize transfers above a threshold',
          'Out-of-band verification: all payment detail changes verified by phone to a pre-established number',
          'Vendor banking change policy: new bank details require 48-hour holding period + manager sign-off',
          'Executive impersonation policy: written policy that no verbal/email-only request from leadership authorizes financial transactions',
          'Clean desk / screen lock policy: reduces risk of shoulder surfing and unattended access',
          'Privileged Access Management (PAM): admin credentials stored in a vault; require checked-out session',
          'Zero-trust network architecture: every access request authenticated regardless of network location',
        ],
        source: 'NIST Cybersecurity Framework 2.0',
      },
      {
        id: 'org-incident-response',
        type: 'diagram-steps',
        title: 'Phishing Incident Response Plan',
        summary: 'Every organization needs a documented, rehearsed plan for when phishing succeeds.',
        detail: 'Speed of containment determines the difference between a minor incident and a catastrophe.',
        steps: [
          {
            step: 1,
            label: 'Detection & Triage (0–15 min)',
            description: 'User reports or security tool alerts. Analyst confirms it\'s phishing. Identifies which users received and clicked.',
            icon: 'Bell',
          },
          {
            step: 2,
            label: 'Containment (15–30 min)',
            description: 'Pull phishing email from all mailboxes organization-wide. Block sending domain in email gateway. Isolate any endpoints that downloaded attachments.',
            icon: 'Shield',
          },
          {
            step: 3,
            label: 'Account Remediation (30–60 min)',
            description: 'Force password reset for all users who clicked or submitted credentials. Revoke all active sessions. Review for inbox rules or forwarding changes.',
            icon: 'KeyRound',
          },
          {
            step: 4,
            label: 'Evidence Collection (ongoing)',
            description: 'Capture email headers, phishing URL, attachment hash, affected account list. Document timeline for potential legal/regulatory reporting.',
            icon: 'FileText',
          },
          {
            step: 5,
            label: 'Stakeholder Communication (1–4 hrs)',
            description: 'Notify affected employees. Brief leadership if material impact. Assess regulatory notification requirements (GDPR 72hr, etc.).',
            icon: 'MessageSquare',
          },
          {
            step: 6,
            label: 'Post-Incident Review (within 1 week)',
            description: 'Root cause analysis. What controls failed? What worked? Update training and controls based on findings.',
            icon: 'BarChart',
          },
        ],
      },
    ],
  },
]

export const DEFENSE_TAKEAWAYS = [
  'Always check the actual sender domain — not the display name — before trusting any email.',
  'Hover over links before clicking. The visible text is irrelevant; the URL in the status bar is what matters.',
  'HTTPS and the padlock only mean the connection is encrypted — not that the site is legitimate.',
  'Not all MFA is equal: FIDO2 hardware keys and passkeys are the only phishing-resistant options.',
  'Never approve an MFA push notification you did not initiate — report it immediately to IT.',
  'Reporting phishing protects every colleague who might receive the same email. Speed matters.',
  'No single defense is sufficient: effective protection layers email filtering, DNS blocking, EDR, and trained employees.',
]
