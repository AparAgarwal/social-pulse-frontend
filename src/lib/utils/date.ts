export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  return `${Math.floor(diffInDays / 365)}y`;
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d);
}

export function formatTimeRemaining(date: string | Date): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  let diffInSeconds = Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));

  const days = Math.floor(diffInSeconds / 86400);
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;

  diffInSeconds %= 86400;
  const hours = Math.floor(diffInSeconds / 3600);
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;

  diffInSeconds %= 3600;
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;

  const seconds = diffInSeconds % 60;
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}
