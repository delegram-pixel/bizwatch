import {  HardDrive, Layers2, Mail } from 'lucide-react'

export  const sources = [
  {
    
    icon: HardDrive,
    title: 'Google Drive',
    description: 'Shared corporate repositories.',
    status: 'Connected',
    accent: 'connected',
  },
  {
    
    icon: Mail,
    title: 'Gmail',
    description: 'Executive communication threads.',
    status: 'Connected',
    accent: 'connected',
  },
  {
    
    icon: Layers2,
    title: 'Slack Knowledge',
    description: 'Click to authorize workspace access.',
    status: 'Inactive',
    accent: 'inactive',
  },
];

export const customSources = [
  {
    title: 'Q4_Market_Analysis',
    time: '2h ago',
    status: 'Synchronized',
    size: '12.5mb',
  },
  {
    title: 'Parent_Draft_v2.txt',
    time:'6h ago',
    status: 'Synchronized',
    size: '42 kb',
  },
  {
    title: 'Competive_Landscape_2024.pptx',
    time: 'Yesterday',
    status: 'Synchronized',
    size: '8.9MB',
  },
  {
    title: 'Annual_Revenue_2',
    time: 'Just now',
    status: 'Indexing',
    size: '1.2mb',
  }
]
