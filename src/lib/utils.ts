import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(isoString: string | null | undefined) {
  if (!isoString) return null
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoString))
}

export function timeAgo(date: string | Date | null | undefined) {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} days ago`
}

export function urgencyColor(urgency: string) {
  return ({ critical: '#FF4757', high: '#F5A623', medium: '#4A9EFF', low: '#8B8FA8' } as Record<string, string>)[urgency] ?? '#8B8FA8'
}

export function severityColor(severity: string) {
  return ({ critical: '#FF4757', warning: '#F5A623', info: '#4A9EFF' } as Record<string, string>)[severity] ?? '#8B8FA8'
}

export function urgencyLabel(urgency: string) {
  return urgency?.toUpperCase() ?? ''
}

export function confidenceDots(confidence: string) {
  return ({ low: '●○○', medium: '●●○', high: '●●●' } as Record<string, string>)[confidence] ?? '○○○'
}

export function outlookStyle(outlook: string) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    positive:   { bg: 'rgba(0,232,122,0.08)',  text: '#00E87A', border: 'rgba(0,232,122,0.25)'  },
    neutral:    { bg: 'rgba(74,158,255,0.08)', text: '#4A9EFF', border: 'rgba(74,158,255,0.25)' },
    cautious:   { bg: 'rgba(245,166,35,0.08)', text: '#F5A623', border: 'rgba(245,166,35,0.25)' },
    concerning: { bg: 'rgba(255,71,87,0.08)',  text: '#FF4757', border: 'rgba(255,71,87,0.25)'  },
  }
  return map[outlook] ?? { bg: 'rgba(139,143,168,0.08)', text: '#8B8FA8', border: 'rgba(139,143,168,0.25)' }
}

export function outlookDescription(outlook: string) {
  return ({
    positive:   'Business outlook is positive',
    neutral:    'Business outlook is stable',
    cautious:   'Some areas need attention',
    concerning: 'Action required — risks detected',
  } as Record<string, string>)[outlook] ?? 'Outlook unknown'
}

export function sourceLabel(source: string) {
  return ({ sheets: 'Sheets', drive: 'Drive', gmail: 'Gmail', calendar: 'Calendar' } as Record<string, string>)[source] ?? source
}
