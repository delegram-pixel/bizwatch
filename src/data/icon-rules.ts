// ─── Icon / colour algorithm ────────────────────────────────────────────────

import { BarChart2, BookOpen, Briefcase, Bug, Database, DollarSign, Lightbulb, Megaphone, MessageSquare, Palette, Rocket, Shield, TrendingUp, Users } from "lucide-react";

// Rules are tested in order; first keyword match wins.
export const ICON_RULES = [
  {
    keywords: ['sales', 'revenue', 'invoice', 'payment', 'billing', 'cash', 'overdue', 'q1', 'q2', 'q3', 'q4', 'quarterly'],
    icon: DollarSign,
    color: 'bg-emerald-500',
  },
  {
    keywords: ['investor', 'pitch', 'fundraising', 'series a', 'deck', 'valuation'],
    icon: BarChart2,
    color: 'bg-orange-500',
  },
  {
    keywords: ['product', 'launch', 'feature', 'roadmap', 'pricing', 'rollout', 'freemium', 'pro'],
    icon: Rocket,
    color: 'bg-violet-500',
  },
  {
    keywords: ['bug', 'error', 'debug', 'fix', 'hotfix', 'escalation', 'broken', 'issue', 'forbidden', '403'],
    icon: Bug,
    color: 'bg-red-500',
  },
  {
    keywords: ['design', 'ux', 'ui', 'onboarding', 'funnel', 'wizard', 'prototype', 'drop-off', 'flow'],
    icon: Palette,
    color: 'bg-sky-500',
  },
  {
    keywords: ['database', 'migration', 'infrastructure', 'backend', 'postgresql', 'mysql', 'schema', 'downtime'],
    icon: Database,
    color: 'bg-amber-500',
  },
  {
    keywords: ['marketing', 'content', 'social', 'blog', 'linkedin', 'email', 'newsletter', 'calendar', 'seo'],
    icon: Megaphone,
    color: 'bg-pink-500',
  },
  {
    keywords: ['partnership', 'legal', 'mou', 'proposal', 'co-marketing', 'api integration', 'deal'],
    icon: Briefcase,
    color: 'bg-indigo-500',
  },
  {
    keywords: ['standup', 'sprint', 'retrospective', 'agile', 'engineering', 'team', 'scrum', 'ci'],
    icon: Users,
    color: 'bg-cyan-500',
  },
  {
    keywords: ['support', 'customer', 'client', 'ticket', 'help'],
    icon: MessageSquare,
    color: 'bg-slate-500',
  },
  {
    keywords: ['security', 'auth', 'compliance', 'permission', 'access', 'oauth'],
    icon: Shield,
    color: 'bg-rose-500',
  },
  {
    keywords: ['knowledge', 'research', 'document', 'study', 'report'],
    icon: BookOpen,
    color: 'bg-teal-500',
  },
  {
    keywords: ['insight', 'analytics', 'prediction', 'trend', 'analysis', 'data', 'forecast'],
    icon: Lightbulb,
    color: 'bg-fuchsia-500',
  },
  {
    keywords: ['performance', 'growth', 'market', 'metric'],
    icon: TrendingUp,
    color: 'bg-green-500',
  },
]