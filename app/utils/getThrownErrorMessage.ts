export default function getThrownErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return fallback;
  }

  return typeof error.message === 'string' && error.message ? error.message : fallback;
}
