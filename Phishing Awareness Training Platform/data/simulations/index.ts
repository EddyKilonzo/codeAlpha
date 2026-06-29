import type { Simulation, SimulationFlag } from '@/types'

export const SIMULATIONS: Record<string, Simulation[]> = {
  'introduction': [
    {
      id: 'sim-intro-1',
      moduleId: 'introduction',
      title: 'Phishing Email — IT Department',
      type: 'email-outlook',
      description: 'Identify the red flags in this suspicious email claiming to be from your IT department.',
      flags: [
        { id: 'f1', label: 'Sender address', description: 'The email comes from "it-support@company-helpdesk.net" — not your company\'s domain.', position: { top: 12, left: 2, width: 60, height: 6 }, type: 'malicious', pointValue: 25 },
        { id: 'f2', label: 'Urgency trigger', description: '"Your password expires in 2 hours" — artificial urgency designed to panic you into acting without thinking.', position: { top: 38, left: 0, width: 100, height: 12 }, type: 'malicious', pointValue: 20 },
        { id: 'f3', label: 'Suspicious link', description: 'The "Reset Password" button links to "secure-login.company-helpdesk.net" — not your company\'s actual IT portal.', position: { top: 62, left: 20, width: 60, height: 8 }, type: 'malicious', pointValue: 30 },
        { id: 'f4', label: 'Generic greeting', description: '"Dear Employee" instead of your name — mass phishing emails often use generic greetings.', position: { top: 26, left: 0, width: 50, height: 6 }, type: 'warning', pointValue: 15 },
      ],
      content: {
        from: 'IT Support <it-support@company-helpdesk.net>',
        to: 'you@yourcompany.com',
        subject: 'URGENT: Your Password Expires in 2 Hours — Action Required',
        time: '09:14 AM',
        body: `Dear Employee,

Our security system has detected that your corporate account password will expire in 2 hours.

To avoid losing access to your email, files, and company systems, you must reset your password immediately.

Your account details:
• Username: [your email]
• Password expiry: TODAY at 11:00 AM
• Status: CRITICAL — immediate action required

[RESET PASSWORD NOW]

Failure to act within 2 hours will result in your account being locked. Contact your manager for re-activation.

IT Security Team
Company Help Desk`,
      },
    },
  ],

  'types-of-phishing': [
    {
      id: 'sim-types-1',
      moduleId: 'types-of-phishing',
      title: 'SMS Phishing — Delivery Notification',
      type: 'sms',
      description: 'You received this SMS. Identify all the phishing indicators.',
      flags: [
        { id: 'f1', label: 'Unknown sender number', description: 'Legitimate DHL uses registered short codes (e.g., 36251), not random mobile numbers like +44 7851 234567.', position: { top: 0, left: 0, width: 100, height: 8 }, type: 'malicious', pointValue: 20 },
        { id: 'f2', label: 'Suspicious link domain', description: 'The link goes to "dhl-parcel-uk.net" — not the official dhl.com or dhl.co.uk domain.', position: { top: 65, left: 0, width: 100, height: 10 }, type: 'malicious', pointValue: 35 },
        { id: 'f3', label: 'Payment request via SMS', description: 'DHL never requests customs fees via SMS text links. Any such request is always conducted through official channels.', position: { top: 40, left: 0, width: 100, height: 20 }, type: 'malicious', pointValue: 25 },
        { id: 'f4', label: 'Urgency — "within 24 hours"', description: 'Artificial time pressure prevents you from verifying the request. Real missed deliveries allow weeks to collect.', position: { top: 75, left: 0, width: 100, height: 10 }, type: 'warning', pointValue: 15 },
      ],
      content: {
        sender: '+44 7851 234567',
        messages: [
          {
            from: 'sender',
            text: 'DHL Express: Your parcel (DE123456789) could not be delivered. A customs fee of £1.99 is required. Pay here: http://dhl-parcel-uk.net/pay/DE123456789 — you must pay within 24 hours or your parcel will be returned.',
            time: '10:23 AM',
          },
        ],
      },
    },
    {
      id: 'sim-types-2',
      moduleId: 'types-of-phishing',
      title: 'CEO Fraud — BEC Attack',
      type: 'email-outlook',
      description: 'A financial request from your CEO. Spot every red flag.',
      flags: [
        { id: 'f1', label: 'Sender is Gmail not company domain', description: 'Real executive communications use the company email domain. "robert.ceo@gmail.com" is immediately suspicious.', position: { top: 10, left: 2, width: 70, height: 6 }, type: 'malicious', pointValue: 30 },
        { id: 'f2', label: 'Urgency + secrecy combined', description: '"Time-sensitive" + "Keep this confidential" — attackers combine urgency with secrecy to prevent victims seeking a second opinion.', position: { top: 42, left: 0, width: 100, height: 10 }, type: 'malicious', pointValue: 25 },
        { id: 'f3', label: 'Financial request via email only', description: 'No legitimate CFO should authorize a wire transfer based solely on an email. Process requires out-of-band phone verification.', position: { top: 52, left: 0, width: 100, height: 15 }, type: 'malicious', pointValue: 25 },
        { id: 'f4', label: 'Bypass normal channels', description: '"Please do not discuss with colleagues" — legitimate requests don\'t ask employees to bypass standard approval processes.', position: { top: 65, left: 0, width: 100, height: 10 }, type: 'warning', pointValue: 15 },
      ],
      content: {
        from: 'Robert Harrison <robert.ceo@gmail.com>',
        to: 'finance@yourcompany.com',
        subject: 'Confidential — Urgent Wire Transfer Required',
        time: '2:47 PM',
        body: `Hi,

I'm currently in a confidential acquisition meeting with our legal team and cannot take calls. We need to process an urgent wire transfer to complete this deal before the close of business today.

Amount: $78,500
Beneficiary: Meridian Partners LLC
Account: [See attached wire instructions]

This is extremely time-sensitive. Please process this before 4pm today. Do not discuss this with colleagues — the acquisition is under NDA.

I'll explain everything when I'm out of the meeting. Please confirm once sent.

Robert Harrison
CEO`,
      },
    },
  ],

  'attacker-operations': [
    {
      id: 'sim-ao-1',
      moduleId: 'attacker-operations',
      title: 'Microsoft Login — Fake Page',
      type: 'login-page',
      description: 'Examine this Microsoft login page. Find the clues that reveal it is a phishing site.',
      flags: [
        { id: 'f1', label: 'Domain is not microsoft.com', description: 'The URL shows "microsoft.com.login-verify.net" — the real domain is "login-verify.net". Legitimate Microsoft login is always "login.microsoftonline.com" or "account.microsoft.com".', position: { top: 3, left: 0, width: 100, height: 5 }, type: 'malicious', pointValue: 40 },
        { id: 'f2', label: 'No organization branding', description: 'Real Microsoft work/school logins show your organization\'s name and logo on the sign-in page when the tenant is recognized.', position: { top: 25, left: 10, width: 80, height: 15 }, type: 'warning', pointValue: 15 },
        { id: 'f3', label: 'Unusual redirect source', description: 'You arrived here via a link in an email — Microsoft will never send you an email asking you to sign in via a link. Go directly to the site.', position: { top: 75, left: 5, width: 90, height: 8 }, type: 'malicious', pointValue: 20 },
        { id: 'f4', label: 'HTTPS present but site is still fake', description: 'The padlock is visible — but 83% of phishing sites use HTTPS. The padlock only proves encryption, not legitimacy.', position: { top: 3, left: 0, width: 10, height: 5 }, type: 'warning', pointValue: 10 },
      ],
      content: {
        url: 'https://microsoft.com.login-verify.net/oauth2/signin',
        favicon: 'lock',
        brand: 'Microsoft',
        logoText: 'Microsoft',
        fields: [
          { label: 'Email, phone, or Skype', type: 'text', placeholder: 'Email, phone, or Skype' },
          { label: 'Password', type: 'password', placeholder: 'Password' },
        ],
        submitText: 'Sign in',
        footerLinks: ['Can\'t access your account?', 'Sign-in options'],
      },
    },
  ],

  'advanced-threats': [
    {
      id: 'sim-adv-1',
      moduleId: 'advanced-threats',
      title: 'QR Code Phishing Email',
      type: 'email-outlook',
      description: 'This email contains a QR code. Identify why this is suspicious and what the risks are.',
      flags: [
        { id: 'f1', label: 'QR code bypasses email scanners', description: 'Email security gateways cannot scan QR codes — the malicious URL is hidden inside the image. This is exactly why quishing is effective.', position: { top: 45, left: 25, width: 50, height: 25 }, type: 'malicious', pointValue: 35 },
        { id: 'f2', label: 'Sender domain is suspicious', description: '"security-team@microsoft-authenticator-support.com" is NOT a Microsoft domain. Real Microsoft emails come from @microsoft.com.', position: { top: 8, left: 2, width: 75, height: 6 }, type: 'malicious', pointValue: 25 },
        { id: 'f3', label: 'Urgency — enrollment deadline', description: '"Complete by end of today" — artificial urgency to prevent careful verification of the QR code destination.', position: { top: 30, left: 0, width: 100, height: 8 }, type: 'warning', pointValue: 15 },
        { id: 'f4', label: 'Redirect to mobile device', description: 'QR codes are scanned on phones — which typically lack corporate EDR, VPN, and URL filtering. The attacker is deliberately targeting your less-protected device.', position: { top: 72, left: 0, width: 100, height: 10 }, type: 'malicious', pointValue: 20 },
      ],
      content: {
        from: 'Microsoft Security <security-team@microsoft-authenticator-support.com>',
        to: 'you@yourcompany.com',
        subject: 'Action Required: Complete Microsoft Authenticator MFA Enrollment',
        time: '11:03 AM',
        body: `Your organization requires all employees to complete Microsoft Authenticator enrollment by end of today.

To enroll your mobile device:
1. Open your phone camera
2. Scan the QR code below
3. Follow the on-screen steps to verify your identity

[QR CODE IMAGE]

Important: This enrollment must be completed today. Failure to enroll will result in loss of access to Microsoft 365 services.

If you have questions, contact your IT administrator.

Microsoft Security Team`,
        hasQRCode: true,
      },
    },
    {
      id: 'sim-adv-2',
      moduleId: 'advanced-threats',
      title: 'Microsoft Teams — Deepfake Request',
      type: 'teams-message',
      description: 'You receive this Teams message from your CFO. Spot the warning signs.',
      flags: [
        { id: 'f1', label: 'External account badge', description: 'The user account shows "(External)" — this CFO account is not in your organization\'s directory, meaning it\'s an external account impersonating your CFO.', position: { top: 2, left: 0, width: 100, height: 10 }, type: 'malicious', pointValue: 35 },
        { id: 'f2', label: 'Financial request via Teams', description: 'Never process financial requests based on a Teams message alone — always verify through an independent channel.', position: { top: 35, left: 0, width: 100, height: 20 }, type: 'malicious', pointValue: 25 },
        { id: 'f3', label: 'Secrecy request', description: '"Don\'t mention this to anyone" — legitimate financial processes never require employees to bypass oversight. This is a social engineering tactic.', position: { top: 60, left: 0, width: 100, height: 12 }, type: 'warning', pointValue: 20 },
        { id: 'f4', label: 'Unusual communication channel', description: 'Your CFO normally uses email or scheduled calls for financial matters — an unexpected Teams message for an urgent financial request is a red flag.', position: { top: 0, left: 0, width: 100, height: 5 }, type: 'warning', pointValue: 15 },
      ],
      content: {
        sender: 'Sarah Chen — CFO (External)',
        avatar: 'SC',
        messages: [
          { from: 'sender', text: 'Hi, are you available? I need your help with something urgent and time-sensitive.', time: '3:05 PM' },
          { from: 'sender', text: 'I\'m in a board meeting and can\'t talk. I need you to process an emergency wire transfer to a new supplier. £32,000. I\'ll send you the account details now.', time: '3:06 PM' },
          { from: 'sender', text: 'Please don\'t mention this to anyone — it\'s related to a confidential acquisition we\'re finalizing. I\'ll explain everything after the meeting.', time: '3:07 PM' },
        ],
      },
    },
  ],

  'case-studies': [
    {
      id: 'sim-cs-1',
      moduleId: 'case-studies',
      title: 'Fake PayPal Login Page',
      type: 'login-page',
      description: 'This PayPal-branded login page appeared after clicking a link in an email. Find the clues it\'s fake.',
      flags: [
        { id: 'f1', label: 'Domain is paypal-secure-login.com', description: 'Real PayPal always uses paypal.com. Any variation (paypal-secure-login.com, paypal.account-verify.net) is a phishing domain.', position: { top: 3, left: 0, width: 100, height: 5 }, type: 'malicious', pointValue: 40 },
        { id: 'f2', label: 'Password manager didn\'t autofill', description: 'If you use a password manager and it didn\'t autofill here, that\'s because it doesn\'t recognize this as the paypal.com domain it saved credentials for — a powerful phishing signal.', position: { top: 55, left: 5, width: 90, height: 10 }, type: 'malicious', pointValue: 25 },
        { id: 'f3', label: 'You arrived via email link', description: 'PayPal will never email you a direct login link. Always go directly to paypal.com by typing it yourself.', position: { top: 78, left: 5, width: 90, height: 8 }, type: 'warning', pointValue: 15 },
        { id: 'f4', label: 'Suspicious favicon', description: 'The favicon doesn\'t match PayPal\'s actual branding — a minor but telling detail for the attentive observer.', position: { top: 3, left: 0, width: 4, height: 5 }, type: 'warning', pointValue: 10 },
      ],
      content: {
        url: 'https://www.paypal-secure-login.com/signin/',
        favicon: 'credit-card',
        brand: 'PayPal',
        logoText: 'PayPal',
        fields: [
          { label: 'Email or mobile number', type: 'email', placeholder: 'Email or mobile number' },
          { label: 'Password', type: 'password', placeholder: 'Password' },
        ],
        submitText: 'Log In',
        footerLinks: ['Forgot password?', 'Sign Up'],
      },
    },
  ],

  'defense-best-practices': [
    {
      id: 'sim-def-1',
      moduleId: 'defense-best-practices',
      title: 'Gmail Inbox — Spot the Phish',
      type: 'email-gmail',
      description: 'Your Gmail inbox has 5 emails. One is a phishing attempt. Identify which one and why.',
      flags: [
        { id: 'f1', label: 'Email 3: Suspicious sender domain', description: '"accounts-noreply@google.com.security-alert.net" — "google.com" is a subdomain here; the real domain is "security-alert.net". Legitimate Google emails always come from @google.com.', position: { top: 48, left: 0, width: 100, height: 10 }, type: 'malicious', pointValue: 35 },
        { id: 'f2', label: 'Email 3: Urgency about account suspension', description: '"Your account will be permanently deleted in 24 hours" — Google does not suspend accounts via email with 24-hour ultimatums.', position: { top: 52, left: 0, width: 100, height: 6 }, type: 'malicious', pointValue: 25 },
        { id: 'f3', label: 'Email 3: Link goes to non-Google domain', description: 'Hovering over "Verify Now" shows it goes to "google-account-verify.net" — not accounts.google.com.', position: { top: 55, left: 0, width: 100, height: 5 }, type: 'malicious', pointValue: 30 },
      ],
      content: {
        emails: [
          { from: 'GitHub', address: 'noreply@github.com', subject: '[GitHub] A new public key was added to your account', preview: 'A new SSH key was added to your account. If you did not perform...', time: '10:23 AM', isPhishing: false, labels: [] },
          { from: 'Notion', address: 'team@mail.notion.so', subject: 'Jordan shared a workspace with you', preview: 'Jordan Lee invited you to join the Marketing team workspace...', time: '9:47 AM', isPhishing: false, labels: [] },
          { from: 'Google Account', address: 'accounts-noreply@google.com.security-alert.net', subject: 'URGENT: Your Google Account will be permanently deleted', preview: 'Unusual activity detected. Verify your account within 24 hours to avoid permanent deletion...', time: '8:31 AM', isPhishing: true, labels: [] },
          { from: 'LinkedIn', address: 'messages-noreply@linkedin.com', subject: 'You appeared in 14 searches this week', preview: 'See who\'s been looking at your profile and reach out...', time: 'Yesterday', isPhishing: false, labels: [] },
          { from: 'Stripe', address: 'receipts@stripe.com', subject: 'Your receipt from Stripe [Invoice #1234]', preview: 'Payment of $49.00 was received for your monthly subscription...', time: 'Yesterday', isPhishing: false, labels: [] },
        ],
      },
    },
    {
      id: 'sim-def-2',
      moduleId: 'defense-best-practices',
      title: 'Browser Warning Page',
      type: 'browser-warning',
      description: 'Your browser is showing this warning. What should you do and why?',
      flags: [
        { id: 'f1', label: 'Certificate error means the site may be impersonating another', description: 'A certificate mismatch (NET::ERR_CERT_AUTHORITY_INVALID) means the site\'s security certificate wasn\'t issued by a trusted authority — possibly indicating a man-in-the-middle attack or a fake site.', position: { top: 25, left: 0, width: 100, height: 15 }, type: 'malicious', pointValue: 30 },
        { id: 'f2', label: '"Advanced" option should be avoided', description: 'Clicking "Advanced" and proceeding anyway bypasses the security warning. Only IT professionals with a specific legitimate reason should bypass certificate errors.', position: { top: 72, left: 5, width: 45, height: 8 }, type: 'malicious', pointValue: 25 },
        { id: 'f3', label: 'Return to safety is the correct action', description: '"Back to safety" is almost always the correct choice when seeing a certificate warning — especially if you arrived via a link rather than by typing the URL yourself.', position: { top: 72, left: 55, width: 40, height: 8 }, type: 'safe', pointValue: 30 },
        { id: 'f4', label: 'Check the URL in the address bar', description: 'Verify the URL you\'re trying to visit is what you expected. If you were phished, the URL may reveal the real destination.', position: { top: 3, left: 0, width: 100, height: 5 }, type: 'warning', pointValue: 10 },
      ],
      content: {
        url: 'https://secure-banking.yourbank.com',
        warningTitle: 'Your connection is not private',
        warningCode: 'NET::ERR_CERT_AUTHORITY_INVALID',
        warningDetail: 'Attackers might be trying to steal your information from secure-banking.yourbank.com (for example, passwords, messages, or credit cards).',
      },
    },
  ],
}
