/** Unsplash photo URL helper for the dummy content (free Unsplash licence). */
export function unsplash(id: string, width = 1600): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}
