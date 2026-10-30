import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { COMMUNITY_CHANNELS, CommunityLinks } from './community-links';

describe('CommunityLinks (T-103, FR-GROW-04)', () => {
  it('renders community section heading, badge, and description', () => {
    render(<CommunityLinks />);

    expect(
      screen.getByRole('heading', { level: 2, name: /never navigate the job hunt alone/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/join 9,000\+ job seekers/i)).toBeInTheDocument();
    expect(screen.getByText(/connect with ambitious candidates/i)).toBeInTheDocument();
  });

  it('renders all four community channels with names and descriptions', () => {
    render(<CommunityLinks />);

    for (const channel of COMMUNITY_CHANNELS) {
      expect(screen.getByRole('heading', { level: 3, name: channel.name })).toBeInTheDocument();
      expect(screen.getByText(channel.description)).toBeInTheDocument();
      expect(screen.getByText(channel.memberCount)).toBeInTheDocument();
      if (channel.activeCount) {
        expect(screen.getByText(channel.activeCount)).toBeInTheDocument();
      }
    }
  });

  it('verifies community links have proper security and accessibility attributes', () => {
    render(<CommunityLinks />);

    const discordLink = screen.getByRole('link', {
      name: /join discord for discord community \(opens in new tab\)/i,
    });
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/nextjob');
    expect(discordLink).toHaveAttribute('target', '_blank');
    expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer');

    const githubLink = screen.getByRole('link', {
      name: /view on github for github repository \(opens in new tab\)/i,
    });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/xb3sox/nextjob');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');

    const slackLink = screen.getByRole('link', {
      name: /join slack for slack workspaces \(opens in new tab\)/i,
    });
    expect(slackLink).toHaveAttribute('href', 'https://nextjob-community.slack.com');

    const discussionsLink = screen.getByRole('link', {
      name: /browse forum for open forum \(opens in new tab\)/i,
    });
    expect(discussionsLink).toHaveAttribute(
      'href',
      'https://github.com/xb3sox/nextjob/discussions'
    );
  });

  it('renders accessible semantic section with landmark id', () => {
    const { container } = render(<CommunityLinks />);

    const section = container.querySelector('section#community');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'community-heading');
  });
});
