import type { NewsArticle } from '@/lib/constants';

/**
 * Hypothetical headlines for the breaking-news box. They are scenarios to test how the agent
 * reacts, not real news: the engine passes them to Gemini marked as unverified operator input.
 */
export const PRESET_BREAKING_NEWS: NewsArticle[] = [
    {
        id: 'breaking-1',
        title: 'RBI unexpectedly cuts the repo rate by 50 basis points',
        summary: 'A larger-than-expected rate cut lowers borrowing costs, typically positive for banks and lenders.',
        source: 'Scenario',
        timeAgo: 'Just now',
        category: 'Macro',
        sentiment: 'Bullish',
        readTime: '1 min read',
    },
    {
        id: 'breaking-2',
        title: 'Tata Steel secures a $2.2B green infrastructure supply contract',
        summary: 'A long-term supply agreement for low-carbon steel would lift volume and margin guidance.',
        source: 'Scenario',
        timeAgo: 'Just now',
        category: 'Earnings',
        sentiment: 'Bullish',
        readTime: '1 min read',
    },
    {
        id: 'breaking-3',
        title: 'Infosys wins a multi-year agentic AI contract with a Fortune 100 bank',
        summary: 'A large AI services deal would improve revenue visibility for Indian IT exporters.',
        source: 'Scenario',
        timeAgo: 'Just now',
        category: 'Sector',
        sentiment: 'Bullish',
        readTime: '1 min read',
    },
    {
        id: 'breaking-4',
        title: 'US announces steep new tariffs on Indian IT services and auto parts',
        summary: 'New trade barriers would hit IT exporters and automakers with US exposure.',
        source: 'Scenario',
        timeAgo: 'Just now',
        category: 'Global',
        sentiment: 'Bearish',
        readTime: '1 min read',
    },
];
