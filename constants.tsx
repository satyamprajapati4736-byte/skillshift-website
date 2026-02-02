
import React from 'react';
import { Skill } from './types';

export const SKILLS: Skill[] = [
  {
    id: 'video-editing',
    title: 'Mobile Video Editing',
    goal: 'Reels / Shorts edit karna seekhna aur clients ke liye kaam start karna (sirf phone se)',
    description: 'Edit reels and shorts using just CapCut or VN. Big demand for creators.',
    difficulty: 'Easy',
    timeToStart: '7-15 days',
    phoneRequired: true,
    tools: ['CapCut', 'VN Editor', 'Instagram'],
    roadmapStages: []
  },
  {
    id: 'social-media',
    title: 'Social Media Manager',
    goal: 'Creators / small businesses ke social accounts manage karna',
    description: 'Managing comments, DMing prospects, and scheduling posts for brands.',
    difficulty: 'Easy',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['Instagram', 'Meta Business Suite', 'Google Sheets'],
    roadmapStages: []
  },
  {
    id: 'content-creator',
    title: 'Content Creator (Reels/Shorts)',
    goal: 'Personal brand build karna aur content se earn karna',
    description: 'Learn to ideate, shoot, and post viral short-form content.',
    difficulty: 'Medium',
    timeToStart: '20-40 days',
    phoneRequired: true,
    tools: ['Instagram', 'YouTube Shorts', 'CapCut'],
    roadmapStages: []
  },
  {
    id: 'insta-growth',
    title: 'Instagram Growth Manager',
    goal: 'Account organic growth and engagement optimize karna',
    description: 'Specialized skill to help brands grow their followers and reach.',
    difficulty: 'Medium',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['Instagram Analytics', 'Notion'],
    roadmapStages: []
  },
  {
    id: 'canva-design',
    title: 'Canva Graphic Designer',
    goal: 'Social media graphics and thumbnails design karna',
    description: 'Master Canva to create professional-looking assets for clients.',
    difficulty: 'Easy',
    timeToStart: '10-20 days',
    phoneRequired: true,
    tools: ['Canva'],
    roadmapStages: []
  },
  {
    id: 'voice-over',
    title: 'Voice-over Artist (Mobile)',
    goal: 'Ads and videos ke liye voice provide karna',
    description: 'Use your voice to earn. Needs a quiet room and a good phone mic.',
    difficulty: 'Easy',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['Dolby On', 'BandLab', 'CapCut'],
    roadmapStages: []
  },
  {
    id: 'research-assistant',
    title: 'Online Research Assistant',
    goal: 'Founders ke liye data and insights collect karna',
    description: 'Find information, organize it, and present it clearly.',
    difficulty: 'Medium',
    timeToStart: '10-20 days',
    phoneRequired: true,
    tools: ['Google Search', 'Google Sheets', 'AI Tools'],
    roadmapStages: []
  },
  {
    id: 'ghost-writing',
    title: 'Ghost Writing',
    goal: 'Founders / creators ke liye tweets, captions, posts likhna',
    description: 'Founders ke liye tweets aur threads likhna. Easy to start with clarity.',
    difficulty: 'Medium',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['Google Docs', 'X (Twitter)'],
    roadmapStages: []
  },
  {
    id: 'caption-writer',
    title: 'Caption & Hook Writer',
    goal: 'Viral hooks and engaging captions likhna',
    description: 'Master the art of attention-grabbing copywriting.',
    difficulty: 'Easy',
    timeToStart: '7-15 days',
    phoneRequired: true,
    tools: ['Instagram', 'Notes App'],
    roadmapStages: []
  },
  {
    id: 'script-writer',
    title: 'Short-form Script Writer',
    goal: 'Reels and TikToks ke liye structured scripts likhna',
    description: 'Learn retention-focused storytelling for creators.',
    difficulty: 'Medium',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['Google Docs', 'Notion'],
    roadmapStages: []
  },
  {
    id: 'blog-writing',
    title: 'Blog Writing (AI-assisted)',
    goal: 'Long-form articles likhna with AI help',
    description: 'Use AI to draft and humans to polish high-ranking blogs.',
    difficulty: 'Medium',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['ChatGPT', 'Google Docs', 'WordPress'],
    roadmapStages: []
  },
  {
    id: 'newsletter',
    title: 'Newsletter Writing',
    goal: 'Weekly newsletters curate and write karna',
    description: 'Build and manage email audiences for brands.',
    difficulty: 'Medium',
    timeToStart: '20-40 days',
    phoneRequired: true,
    tools: ['Substack', 'Beehiiv', 'Google Docs'],
    roadmapStages: []
  },
  {
    id: 'ai-prompting',
    title: 'Prompt Engineering',
    goal: 'AI se best output nikalna + logon ke liye prompts banana',
    description: 'Learn to talk to AI to get perfect results. Every company needs this now.',
    difficulty: 'Medium',
    timeToStart: '10-20 days',
    phoneRequired: true,
    tools: ['ChatGPT', 'Gemini', 'Midjourney'],
    roadmapStages: []
  },
  {
    id: 'ai-operator',
    title: 'AI Tools Operator',
    goal: 'AI tools ko business workflows mein use karna',
    description: 'Master multiple AI tools to speed up business tasks.',
    difficulty: 'Medium',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['ChatGPT', 'Claude', 'Canva AI'],
    roadmapStages: []
  },
  {
    id: 'no-code',
    title: 'No-Code Website Builder',
    goal: 'Simple websites/landing pages banana without coding',
    description: 'Build professional sites using drag-and-drop tools.',
    difficulty: 'Hard',
    timeToStart: '20-40 days',
    phoneRequired: false,
    tools: ['Carrd', 'Wix', 'Typedream'],
    roadmapStages: []
  },
  {
    id: 'automation',
    title: 'Automation Assistant',
    goal: 'Zapier/Make use karke tasks automate karna',
    description: 'Connect different apps to save time for businesses.',
    difficulty: 'Hard',
    timeToStart: '30-60 days',
    phoneRequired: false,
    tools: ['Zapier', 'Make.com', 'Google Sheets'],
    roadmapStages: []
  },
  {
    id: 'virtual-assistant',
    title: 'Virtual Assistant',
    goal: 'Remote admin and management tasks handle karna',
    description: 'Help busy entrepreneurs manage their schedule and emails.',
    difficulty: 'Easy',
    timeToStart: '10-20 days',
    phoneRequired: true,
    tools: ['Google Calendar', 'Gmail', 'Trello'],
    roadmapStages: []
  },
  {
    id: 'customer-support',
    title: 'Customer Support (Chat/Email)',
    goal: 'Brand ke queries and tickets solve karna',
    description: 'Professional communication via chat and email.',
    difficulty: 'Easy',
    timeToStart: '7-15 days',
    phoneRequired: true,
    tools: ['Zendesk', 'Intercom', 'Gmail'],
    roadmapStages: []
  },
  {
    id: 'data-entry',
    title: 'Data Entry & Cleanup',
    goal: 'Accurate data management and spreadsheets',
    description: 'High-speed data entry and database cleaning.',
    difficulty: 'Easy',
    timeToStart: '5-10 days',
    phoneRequired: true,
    tools: ['Excel', 'Google Sheets'],
    roadmapStages: []
  },
  {
    id: 'community-manager',
    title: 'Online Community Manager',
    goal: 'Discord/Telegram communities build and manage karna',
    description: 'Keep online groups active and moderated.',
    difficulty: 'Medium',
    timeToStart: '15-30 days',
    phoneRequired: true,
    tools: ['Discord', 'Telegram', 'Slack'],
    roadmapStages: []
  }
];

export const Icons = {
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  Chat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Map: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  )
};
