import { renderOnboardingSeries } from './onboarding';
import { renderReengagementSeries } from './reengagement';
import type { EmailTemplateOutput, EmailVariables } from './types';
import { renderWelcomeSeries } from './welcome';

export { renderOnboardingSeries } from './onboarding';
export { renderReengagementSeries } from './reengagement';
export * from './types';
export { renderWelcomeSeries } from './welcome';

export function renderEmailTemplate(
  sequence: 'welcome' | 'onboarding' | 're-engagement',
  step: number,
  vars: EmailVariables
): EmailTemplateOutput {
  if (sequence === 'welcome') {
    return renderWelcomeSeries(step as 1 | 2 | 3, vars);
  }
  if (sequence === 'onboarding') {
    return renderOnboardingSeries(step as 1 | 2 | 3 | 4 | 5, vars);
  }
  return renderReengagementSeries(1, vars);
}
