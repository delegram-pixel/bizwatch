export const mockData = {
  connectedSources: { sheets: true, drive: true, gmail: false, calendar: false },
  insights: {
    summary: 'Business showing signs of client communication lag and overdue payments.',
    insights: [
      {
        id: 'ins_001',
        type: 'financial',
        title: '₦840,000 in overdue invoices',
        detail:
          '3 invoices totalling ₦840,000 are overdue by more than 14 days. Clients: Apex Supply, TechBridge Ltd, Okafor & Co.',
        severity: 'critical',
        source: 'sheets',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'ins_002',
        type: 'communication',
        title: 'Response time doubled this month',
        detail: 'Average client response time increased from 4 hours to 11 hours this month.',
        severity: 'warning',
        source: 'gmail',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'ins_003',
        type: 'client',
        title: 'Zenith Logistics — 28 days silent',
        detail: 'No communication with Zenith Logistics in 28 days. Previously weekly exchanges.',
        severity: 'warning',
        source: 'gmail',
        timestamp: new Date().toISOString(),
      },
    ],
  },
  predictions: {
    outlook: 'cautious',
    predictions: [
      {
        id: 'pred_001',
        type: 'cashflow',
        title: 'Cash shortfall likely in ~5 weeks',
        detail:
          'Projected income falls short of monthly expenses around week 5 based on current patterns.',
        confidence: 'medium',
        timeframe: '~5 weeks',
        recommended_action:
          'Follow up on the 3 overdue invoices this week. Request partial payment from Apex Supply.',
        source: 'sheets',
      },
      {
        id: 'pred_002',
        type: 'workload',
        title: 'Busy period approaching — end of month',
        detail: 'Historically your busiest week. Calendar already shows 6 client meetings booked.',
        confidence: 'high',
        timeframe: '2 weeks',
        recommended_action: 'Block focus time before the meeting-heavy week to clear admin.',
        source: 'calendar',
      },
    ],
  },
  alerts: {
    unread_count: 2,
    alerts: [
      {
        id: 'alert_001',
        type: 'churn_risk',
        title: 'Zenith Logistics — Churn Risk',
        detail: 'Key client has not responded to 3 follow-up emails over 28 days.',
        urgency: 'critical',
        action_required: 'Send a personal follow-up or call today.',
        deadline: new Date(Date.now() + 2 * 864e5).toISOString(),
        source: 'gmail',
        client_or_entity: 'Zenith Logistics',
      },
      {
        id: 'alert_002',
        type: 'contract_expiry',
        title: 'Apex Supply contract expiring in 11 days',
        detail: 'Agreement in Drive expires in 11 days. No renewal discussion found in Gmail.',
        urgency: 'high',
        action_required: 'Initiate renewal conversation before end of this week.',
        deadline: new Date(Date.now() + 11 * 864e5).toISOString(),
        source: 'drive',
        client_or_entity: 'Apex Supply',
      },
    ],
  },
}

export const mockUser = {
  name: 'Chisom Okafor',
  email: 'chisom@bizwatch.ng',
  picture: 'https://i.pravatar.cc/40?img=47',
  connectedSources: { drive: true, sheets: true, gmail: true, calendar: true },
}
