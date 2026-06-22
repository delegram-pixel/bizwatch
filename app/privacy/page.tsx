import { BarChart2 } from 'lucide-react'
import Link from 'next/link'

const LAST_UPDATED = 'June 22, 2025'
const CONTACT_EMAIL = 'dev@renaissancelabs.org'
const APP_URL = 'https://bizwatch-kappa.vercel.app'

const sections = [
  {
    title: '1. Who We Are',
    body: `BizWatch is an AI-powered business intelligence tool built by Renaissance Labs. It connects to your Google Workspace account and surfaces insights about your business activity — overdue invoices, client engagement trends, cash flow signals, and calendar commitments — without you having to ask.`,
  },
  {
    title: '2. What Data We Access',
    body: `When you connect your Google account, BizWatch requests read-only access to the following Google services:`,
    list: [
      { label: 'Gmail', detail: 'To identify communication patterns with clients, detect unanswered follow-ups, and surface relationship signals.' },
      { label: 'Google Drive', detail: 'To read documents and files relevant to your business operations, such as invoices, contracts, and reports.' },
      { label: 'Google Sheets', detail: 'To analyse structured business data such as revenue records, inventory, and financial summaries.' },
      { label: 'Google Calendar', detail: 'To understand scheduling context, upcoming commitments, and time-sensitive business events.' },
    ],
    footer: 'We only request read-only scopes. BizWatch cannot send emails, create files, modify documents, or make any changes to your Google account.',
  },
  {
    title: '3. How We Use Your Data',
    body: `Data accessed from your Google Workspace is used exclusively to generate business insights for you. Specifically:`,
    list: [
      { label: 'Insight generation', detail: 'We pass your data to an AI model (Anthropic Claude) to produce summaries, predictions, and alerts relevant to your business.' },
      { label: 'Chat context', detail: 'When you ask BizWatch a question, relevant data is included in the AI prompt to produce an accurate answer.' },
      { label: 'Analysis', detail: 'We may process your data to identify patterns over time, such as recurring payment delays or client inactivity.' },
    ],
    footer: 'Your data is never used to train AI models, sold to third parties, or shared outside of the services required to operate BizWatch.',
  },
  {
    title: '4. Data Storage',
    body: `BizWatch is designed to minimise data retention:`,
    list: [
      { label: 'Google Workspace content', detail: 'Email bodies, file contents, and calendar details are fetched at query time and processed in memory. They are not persisted to our database.' },
      { label: 'File metadata', detail: 'We store a minimal reference (file ID, modification timestamp, and an Anthropic Files API file ID) for PDF documents to enable caching and avoid re-uploading unchanged files. No file content is stored on our servers.' },
      { label: 'Account information', detail: 'We store your name, email address, and Google OAuth tokens (encrypted) to maintain your session and reconnect to Google on your behalf.' },
      { label: 'Chat history', detail: 'Conversation history is stored locally in your browser (localStorage) and is not sent to our servers.' },
    ],
  },
  {
    title: '5. Third-Party Services',
    body: `BizWatch uses the following third-party services to operate:`,
    list: [
      { label: 'Anthropic Claude', detail: 'AI model used to generate insights from your data. Subject to Anthropic\'s privacy policy at anthropic.com/privacy.' },
      { label: 'Google APIs', detail: 'Used to access your Workspace data with your permission. Subject to Google\'s privacy policy at policies.google.com/privacy.' },
      { label: 'Vercel', detail: 'Infrastructure and hosting provider. Subject to Vercel\'s privacy policy at vercel.com/legal/privacy-policy.' },
      { label: 'Neon (PostgreSQL)', detail: 'Database provider used to store account metadata and file references. Data is encrypted at rest.' },
    ],
    footer: 'We do not sell, rent, or share your personal data with advertisers or data brokers.',
  },
  {
    title: '6. Your Rights',
    body: `You have the following rights regarding your data:`,
    list: [
      { label: 'Revoke access', detail: 'You can disconnect BizWatch from your Google account at any time by visiting myaccount.google.com → Security → Third-party apps with account access.' },
      { label: 'Delete your account', detail: 'You can delete your BizWatch account from the Settings page. This removes all stored account data from our database.' },
      { label: 'Data export', detail: 'You may request a copy of the data we hold about you by contacting us at the email below.' },
      { label: 'Correction', detail: 'If any stored information is inaccurate, contact us and we will correct it promptly.' },
    ],
  },
  {
    title: '7. Security',
    body: `We take reasonable technical measures to protect your data. OAuth tokens are encrypted before storage. All data in transit is protected by TLS. Access to production systems is restricted to authorised personnel only. We do not log email or file content.`,
  },
  {
    title: '8. Children',
    body: `BizWatch is intended for use by business owners and professionals. We do not knowingly collect data from children under the age of 13. If you believe a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: '9. Changes to This Policy',
    body: `We may update this privacy policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of BizWatch after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: '10. Contact Us',
    body: `If you have questions about this privacy policy or your data, please contact us at:`,
    contact: CONTACT_EMAIL,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <BarChart2 size={13} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">BizWatch</span>
          </Link>
          <Link
            href="/connect"
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-14">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Intro */}
        <p className="text-[15px] text-slate-600 leading-relaxed mb-12">
          This Privacy Policy explains how BizWatch ("we", "us", "our") collects, uses, and protects
          information when you use our service at{' '}
          <span className="font-medium text-slate-900">{APP_URL}</span>. By using BizWatch, you agree to
          the practices described in this policy.
        </p>

        {/* Sections */}
        <div className="flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>

              {section.body && (
                <p className="text-[14px] text-slate-600 leading-relaxed">{section.body}</p>
              )}

              {section.list && (
                <ul className="flex flex-col gap-3 mt-1">
                  {section.list.map((item) => (
                    <li key={item.label} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                      <span className="text-[13px] font-semibold text-slate-900 shrink-0 min-w-[130px]">{item.label}</span>
                      <span className="text-[13px] text-slate-500 leading-relaxed">{item.detail}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.footer && (
                <p className="text-[13px] text-slate-500 leading-relaxed border-l-2 border-violet-300 pl-3">
                  {section.footer}
                </p>
              )}

              {section.contact && (
                <a
                  href={`mailto:${section.contact}`}
                  className="text-[14px] font-medium text-violet-600 hover:text-violet-700 transition-colors w-fit"
                >
                  {section.contact}
                </a>
              )}
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-14 pt-8 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            This privacy policy was written to satisfy Google's OAuth API Services User Data Policy requirements.
            BizWatch's use of data received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </div>
      </main>

    </div>
  )
}
