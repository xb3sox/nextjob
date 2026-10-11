import posthog from 'posthog-js';

// ============================================================================
// Analytics Configuration
// ============================================================================

// Use environment variables if available, otherwise use defaults
const POSTHOG_API_KEY = (import.meta as any).env?.VITE_POSTHOG_API_KEY || 'placeholder_key';
const POSTHOG_HOST = (import.meta as any).env?.VITE_POSTHOG_HOST || 'https://app.posthog.com';

// ============================================================================
// Analytics Service
// ============================================================================

class AnalyticsService {
  private initialized = false;

  /**
   * Initialize PostHog analytics
   */
  init(): void {
    if (this.initialized) return;

    if (POSTHOG_API_KEY === 'placeholder_key') {
      console.warn('PostHog API key not configured. Analytics disabled.');
      return;
    }

    posthog.init(POSTHOG_API_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    });

    this.initialized = true;
  }

  /**
   * Track page view
   */
  trackPageView(url?: string): void {
    if (!this.initialized) return;
    posthog.capture('$pageview', { url });
  }

  /**
   * Track custom event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;
    posthog.capture(eventName, properties);
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: Record<string, any>): void {
    if (!this.initialized) return;
    posthog.identify(userId, properties);
  }

  /**
   * Reset user identity
   */
  reset(): void {
    if (!this.initialized) return;
    posthog.reset();
  }

  /**
   * Track landing page events
   */
  trackLandingPage() {
    this.track('landing_page_viewed');
  }

  /**
   * Track CTA clicks
   */
  trackCTAClick(ctaName: string, location: string) {
    this.track('cta_clicked', { cta_name: ctaName, location });
  }

  /**
   * Track signup form submission
   */
  trackSignupSubmit(email: string) {
    this.track('signup_form_submitted', { email });
  }

  /**
   * Track signup success
   */
  trackSignupSuccess() {
    this.track('signup_success');
  }

  /**
   * Track signup error
   */
  trackSignupError(errorMessage: string) {
    this.track('signup_error', { error: errorMessage });
  }

  /**
   * Track pricing section view
   */
  trackPricingView() {
    this.track('pricing_section_viewed');
  }

  /**
   * Track FAQ interaction
   */
  trackFAQInteraction(question: string) {
    this.track('faq_interaction', { question });
  }

  /**
   * Track exit intent popup
   */
  trackExitIntent() {
    this.track('exit_intent_triggered');
  }

  /**
   * Track sticky CTA view
   */
  trackStickyCTAView() {
    this.track('sticky_cta_viewed');
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Initialize on module load
if (typeof window !== 'undefined') {
  analytics.init();
}
