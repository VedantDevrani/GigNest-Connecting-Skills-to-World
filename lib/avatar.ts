/**
 * Generates a DiceBear Dylan-style avatar as an SVG data URI.
 * Seed should always be the user's EMAIL — emails are unique in the DB,
 * so every user is guaranteed a distinct avatar regardless of their name.
 * Set `randomizeIds: true` so SVG element IDs don't clash when multiple avatars appear on one page.
 *
 * Uses dynamic imports because @dicebear packages are pure ESM (serverExternalPackages).
 */
export async function generateAvatar(seed: string): Promise<string> {
  const { createAvatar } = await import('@dicebear/core');
  const { dylan } = await import('@dicebear/collection');

  const avatar = createAvatar(dylan, {
    seed,
    randomizeIds: true,
  });

  // Return as an inline SVG data URI so it can be used directly in <img src="...">
  return avatar.toDataUri();
}
