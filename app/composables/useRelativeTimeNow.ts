import { onMounted, readonly } from 'vue';

const relativeTimeNowStateKey = 'gitpulse-relative-time-now';

let clientNowInitialized = false;

export default function useRelativeTimeNow() {
  const now = useState<string>(relativeTimeNowStateKey, () => new Date().toISOString());

  if (import.meta.client && !clientNowInitialized) {
    clientNowInitialized = true;
    onMounted(() => {
      now.value = new Date().toISOString();
    });
  }

  return readonly(now);
}
