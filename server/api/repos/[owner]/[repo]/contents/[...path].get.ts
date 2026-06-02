import { fetchRepoContents } from '#server/utils/repo-contents-utils';

export default defineEventHandler(async (event) => {
  return fetchRepoContents(event);
});
