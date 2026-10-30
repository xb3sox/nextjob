export interface NewsletterSubscriber {
  id: string;
  email: string;
  consent: boolean;
  consentTimestamp: string;
  source: 'footer' | 'lead_magnet' | 'exit_intent' | 'standalone';
  leadMagnetId?: string;
  createdAt: string;
}

export interface RouteResponse<T = unknown> {
  status: number;
  body: T;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class NewsletterStore {
  private subscribers: Map<string, NewsletterSubscriber> = new Map();

  addSubscriber(subscriber: NewsletterSubscriber): NewsletterSubscriber {
    this.subscribers.set(subscriber.email.toLowerCase(), subscriber);
    return subscriber;
  }

  getSubscriber(email: string): NewsletterSubscriber | undefined {
    return this.subscribers.get(email.toLowerCase());
  }

  getAllSubscribers(): NewsletterSubscriber[] {
    return Array.from(this.subscribers.values());
  }

  clear(): void {
    this.subscribers.clear();
  }
}

export const newsletterStore = new NewsletterStore();

export async function GET(): Promise<RouteResponse> {
  const subscribers = newsletterStore.getAllSubscribers();
  return {
    status: 200,
    body: {
      success: true,
      count: subscribers.length,
      data: subscribers,
    },
  };
}

export async function POST(requestData: {
  email?: string;
  consent?: boolean;
  source?: 'footer' | 'lead_magnet' | 'exit_intent' | 'standalone';
  leadMagnetId?: string;
}): Promise<RouteResponse> {
  const { email, consent, source = 'footer', leadMagnetId } = requestData || {};

  if (!email || typeof email !== 'string') {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Email address is required.',
      },
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Please enter a valid email address.',
      },
    };
  }

  if (consent !== true) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'GDPR consent is required to capture email.',
      },
    };
  }

  const validSources = ['footer', 'lead_magnet', 'exit_intent', 'standalone'];
  const finalSource = validSources.includes(source) ? source : 'footer';

  const existing = newsletterStore.getSubscriber(normalizedEmail);
  const now = new Date().toISOString();

  const subscriber: NewsletterSubscriber = {
    id: existing ? existing.id : `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    email: normalizedEmail,
    consent: true,
    consentTimestamp: now,
    source: finalSource as NewsletterSubscriber['source'],
    leadMagnetId: leadMagnetId ? String(leadMagnetId) : undefined,
    createdAt: existing ? existing.createdAt : now,
  };

  newsletterStore.addSubscriber(subscriber);

  return {
    status: existing ? 200 : 201,
    body: {
      success: true,
      message: existing
        ? 'Subscription updated successfully.'
        : 'Subscription created successfully.',
      data: subscriber,
    },
  };
}
