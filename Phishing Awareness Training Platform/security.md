# Security Hardening Prompt – Frontend-Only Phishing Awareness Training Platform

Perform a comprehensive security review and harden the entire application following modern frontend security best practices and the **OWASP Top 10** where applicable. Although this is a client-side application with no backend or authentication, it should demonstrate production-quality security practices and secure coding standards.

The objective is to make the application resilient against common frontend vulnerabilities while maintaining excellent performance, accessibility, and user experience.

---

# Overall Security Audit

Conduct a full security audit of the codebase before implementing changes.

Review:

* All React components
* Forms
* User inputs
* Local Storage usage
* PDF certificate generation
* Routing
* External links
* Third-party libraries
* Build configuration
* Environment configuration
* Error handling
* Dependency security

Remove unnecessary code and eliminate any insecure patterns.

---

# Input Validation & Sanitization

Treat **all user input as untrusted**, even though the application is client-side.

Validate and sanitize every field, including:

* Certificate name
* Search inputs (if added)
* Feedback forms (if added)
* Query parameters
* URL parameters

Requirements:

* Trim whitespace
* Enforce minimum and maximum lengths
* Restrict invalid characters where appropriate
* Escape HTML special characters
* Prevent JavaScript injection
* Reject malformed input gracefully

Provide clear, user-friendly validation messages.

---

# Cross-Site Scripting (XSS)

Protect the application from XSS vulnerabilities.

Requirements:

* Never use `dangerouslySetInnerHTML` unless absolutely necessary.
* Avoid rendering raw HTML.
* Escape all user-generated content before rendering.
* Sanitize any dynamic content.
* Never execute user-provided scripts.

The certificate name should always be safely escaped before displaying or exporting.

---

# PDF Certificate Security

The certificate generation feature must be secure.

Requirements:

* Sanitize the user's name before rendering.
* Escape special characters.
* Prevent HTML or JavaScript injection into the generated PDF.
* Prevent malformed PDF output.
* Ensure user input cannot alter the certificate layout or execute unintended content.

---

# Secure Local Storage

Use Local Storage only for non-sensitive information.

Allowed:

* Progress
* Completed lessons
* Quiz scores
* XP
* Achievements
* User preferences
* Theme selection

Do **not** store:

* Passwords
* Tokens
* API keys
* Secrets
* Sensitive personal information

Validate Local Storage data before using it.

If stored data is corrupted or manually modified, recover gracefully without crashing the application.

---

# Content Security Policy (CSP)

Configure a strict Content Security Policy.

Restrict:

* Script sources
* Style sources
* Font sources
* Image sources
* Frame embedding

Disallow unnecessary inline scripts where possible.

Only permit trusted resources.

---

# Security Headers

Configure appropriate security headers for deployment.

Include:

* Content-Security-Policy
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* X-Frame-Options (or CSP `frame-ancestors`)
* Strict-Transport-Security (for production over HTTPS)

The application should be protected against clickjacking and MIME-type sniffing.

---

# External Links

Any external links that open in a new tab must use:

* `target="_blank"`
* `rel="noopener noreferrer"`

Prevent reverse tabnabbing and improve browser security.

---

# Routing Security

Review all routes.

Requirements:

* Handle invalid routes gracefully
* Display a polished custom 404 page
* Prevent routing errors from crashing the application
* Validate dynamic route parameters if introduced

---

# Error Handling

Improve error handling across the application.

Requirements:

* Friendly error pages
* Error boundaries for React components
* No sensitive debugging information exposed to users
* No stack traces in production
* Graceful recovery from runtime errors

The application should never fail silently or crash unexpectedly.

---

# Dependency Security

Audit every dependency.

Requirements:

* Update packages with known vulnerabilities
* Remove unused libraries
* Minimize dependency footprint
* Use actively maintained packages
* Lock package versions where appropriate

Run dependency audits and resolve security warnings.

---

# Environment Configuration

Review environment variables.

Requirements:

* Do not hardcode secrets
* Keep sensitive configuration out of the codebase
* Ignore `.env` files in version control
* Provide a clean `.env.example` if environment variables are needed in the future

---

# Code Quality & Secure Coding

Improve maintainability while strengthening security.

Requirements:

* Remove dead code
* Remove unused imports
* Refactor duplicated logic
* Improve TypeScript typings
* Strengthen null and undefined handling
* Improve input validation utilities
* Follow consistent coding standards

---

# Performance & Security

Security improvements should not reduce performance.

Maintain:

* Fast loading
* Smooth animations
* Responsive interactions
* Efficient rendering
* Optimized assets

Security should be implemented without sacrificing user experience.

---

# Accessibility

Security enhancements must remain fully accessible.

Maintain:

* Keyboard navigation
* Screen reader compatibility
* Accessible validation messages
* High contrast support
* Reduced motion compatibility

---

# Production Readiness Checklist

Before deployment, verify that:

* All user inputs are validated and sanitized.
* No XSS vulnerabilities exist.
* No unsafe HTML rendering is used.
* The certificate generation safely handles user input.
* Local Storage stores only non-sensitive data.
* Corrupted Local Storage is handled gracefully.
* Security headers are configured correctly.
* A strict Content Security Policy is in place.
* External links are secured with `noopener noreferrer`.
* Dependencies have been audited and updated.
* No secrets or sensitive configuration are committed.
* The application builds without warnings or errors.
* No production console errors or unnecessary debug logs remain.

---

# Final Goal

Deliver a secure, production-ready frontend application that demonstrates modern secure web development practices. The platform should follow OWASP recommendations where applicable, protect against common client-side vulnerabilities, validate and sanitize all user input, safely generate PDF certificates, securely manage browser storage, and remain fast, accessible, and reliable. Security should be seamlessly integrated into the application's architecture without compromising the premium user experience.
