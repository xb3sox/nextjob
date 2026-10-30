import { ArrowUpRight, Github, Hash, MessageSquare, MessagesSquare, Users } from 'lucide-react';
import type React from 'react';

export interface CommunityChannel {
  id: string;
  name: string;
  description: string;
  memberCount: string;
  activeCount?: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  ctaText: string;
}

export const COMMUNITY_CHANNELS: CommunityChannel[] = [
  {
    id: 'discord',
    name: 'Discord Community',
    description:
      'Real-time job search strategy, daily application tips, and community interview debriefs with verified candidates.',
    memberCount: '4,200+ members',
    activeCount: '850+ online',
    url: 'https://discord.gg/nextjob',
    icon: MessageSquare,
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    ctaText: 'Join Discord',
  },
  {
    id: 'slack',
    name: 'Slack Workspaces',
    description:
      'Senior engineers, hiring managers, and career switchers sharing unlisted roles, referrals, and resume feedback.',
    memberCount: '2,800+ members',
    activeCount: '420+ online',
    url: 'https://nextjob-community.slack.com',
    icon: Hash,
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    ctaText: 'Join Slack',
  },
  {
    id: 'github',
    name: 'GitHub Repository',
    description:
      'Star our open repository, inspect tamper-proof verification schemas, contribute ATS adapters, and read our RFCs.',
    memberCount: '1,500+ stars',
    activeCount: '340+ forks',
    url: 'https://github.com/xb3sox/nextjob',
    icon: Github,
    badgeColor: 'text-fog border-white/20 bg-white/5',
    ctaText: 'View on GitHub',
  },
  {
    id: 'discussions',
    name: 'Open Forum',
    description:
      'In-depth architectural guides, ATS reverse-engineering reports, and asynchronous peer questions.',
    memberCount: '850+ topics',
    activeCount: '5.2k+ replies',
    url: 'https://github.com/xb3sox/nextjob/discussions',
    icon: MessagesSquare,
    badgeColor: 'text-moss border-moss/30 bg-moss/10',
    ctaText: 'Browse Forum',
  },
];

export interface CommunityLinksProps {
  className?: string;
}

export function CommunityLinks({ className = '' }: CommunityLinksProps) {
  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      className={`py-24 px-6 border-t border-white/5 relative ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-moss/30 bg-moss/10 text-moss text-xs font-medium mb-4">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Join 9,000+ Job Seekers</span>
          </div>
          <h2 id="community-heading" className="font-display text-4xl mb-4 text-paper">
            Never navigate the job hunt alone.
          </h2>
          <p className="text-fog text-base leading-relaxed">
            Connect with ambitious candidates, share verified salary data, and learn how top
            applicants leverage NextJob to land roles at leading technology companies.
          </p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMUNITY_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <article
                key={channel.id}
                className="group relative flex flex-col justify-between p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-moss/30 transition-all duration-200"
              >
                <div>
                  {/* Channel icon & badges */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-paper group-hover:text-moss group-hover:border-moss/30 transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    {channel.activeCount && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-moss/20 bg-moss/5 text-moss">
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse"
                          aria-hidden="true"
                        />
                        {channel.activeCount}
                      </span>
                    )}
                  </div>

                  {/* Channel Name */}
                  <h3 className="text-base font-semibold text-paper mb-2 group-hover:text-white transition-colors">
                    {channel.name}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-fog leading-relaxed mb-6">{channel.description}</p>
                </div>

                {/* Footer stats & link */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-medium text-fog/80 tnum">
                    {channel.memberCount}
                  </span>
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-moss hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-moss rounded"
                    aria-label={`${channel.ctaText} for ${channel.name} (opens in new tab)`}
                  >
                    <span>{channel.ctaText}</span>
                    <ArrowUpRight
                      className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
