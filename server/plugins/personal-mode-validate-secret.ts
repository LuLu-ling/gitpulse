import { resolveAuthProviderState } from '../utils/auth-providers';
import { assertPersonalCookieSecretStrength } from '../utils/personal-mode-utils';

export default defineNitroPlugin(() => {
  if (import.meta.prerender) {
    return;
  }

  const providerState = resolveAuthProviderState();

  if (!providerState.personalMode) {
    return;
  }

  assertPersonalCookieSecretStrength();
});
