import NextAuth from "next-auth"
import Resend from "next-auth/providers/resend"
import type { NextAuthConfig } from "next-auth"

// Custom email template - minimal, elegant, on-brand
function generateEmailHTML({ url }: { url: string }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Pay Lobster</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 420px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <span style="font-size: 48px;">🦞</span>
            </td>
          </tr>
          
          <!-- Card -->
          <tr>
            <td style="background-color: #141414; border-radius: 16px; padding: 40px 32px; border: 1px solid #262626;">
              <!-- Heading -->
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #ffffff; text-align: center;">
                Sign in to Pay Lobster
              </h1>
              
              <!-- Subtext -->
              <p style="margin: 0 0 32px 0; font-size: 15px; color: #737373; text-align: center; line-height: 1.5;">
                Click the button below to securely sign in.<br>This link expires in 24 hours.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${url}" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                      Sign In
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alt link -->
              <p style="margin: 32px 0 0 0; font-size: 13px; color: #525252; text-align: center; line-height: 1.5;">
                Button not working? Copy this link:<br>
                <a href="${url}" style="color: #ea580c; word-break: break-all;">${url}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #525252;">
                Trustless payments for AI agents
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #404040;">
                If you didn't request this email, you can ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

function generateEmailText({ url }: { url: string }) {
  return `Sign in to Pay Lobster\n\nClick this link to sign in:\n${url}\n\nThis link expires in 24 hours.\n\nIf you didn't request this email, you can ignore it.`
}

// Base config for middleware (Edge Runtime compatible - no adapter)
export const authConfig: NextAuthConfig = {
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "Pay Lobster <noreply@paylobster.com>",
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { Resend: ResendClient } = await import('resend')
        const resend = new ResendClient(provider.apiKey)
        
        await resend.emails.send({
          from: provider.from as string,
          to: email,
          subject: 'Sign in to Pay Lobster 🦞',
          html: generateEmailHTML({ url }),
          text: generateEmailText({ url }),
        })
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnSettings = nextUrl.pathname.startsWith('/settings')
      const isOnHistory = nextUrl.pathname.startsWith('/history')
      const isOnCredit = nextUrl.pathname.startsWith('/credit')
      const isOnAnalytics = nextUrl.pathname.startsWith('/analytics')

      if (isOnDashboard || isOnSettings || isOnHistory || isOnCredit || isOnAnalytics) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }
      return true
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
