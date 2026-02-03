export type MilestoneType = 'hellos_10' | 'hellos_25' | 'hellos_50' | 'hellos_100' | 'challenge_complete';

export interface MilestoneInfo {
  type: MilestoneType;
  count: number;
  title: string;
  subtitle: string;
  quote: string;
}

export const MILESTONE_CONFIG: Record<MilestoneType, Omit<MilestoneInfo, 'type' | 'count'> & { count: number }> = {
  hellos_10: {
    count: 10,
    title: 'Milestone Unlocked!',
    subtitle: "You've logged 10 hellos!",
    quote: 'Reconnecting the world,\none hello at a time 🦝',
  },
  hellos_25: {
    count: 25,
    title: 'Quarter-Century!',
    subtitle: '25 hellos logged!',
    quote: 'Building connections,\none hello at a time 🦝',
  },
  hellos_50: {
    count: 50,
    title: 'Halfway There!',
    subtitle: '50 hellos logged!',
    quote: "You're on fire! Keep going 🦝",
  },
  hellos_100: {
    count: 100,
    title: 'Triple Digits! 💯',
    subtitle: '100 hellos logged!',
    quote: "You're a true connector 🦝",
  },
  challenge_complete: {
    count: 30,
    title: 'Challenge Complete! 🎉',
    subtitle: 'All 30 challenges mastered!',
    quote: 'From stranger to friend,\none hello at a time 🦝',
  },
};

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export function generateShareCard(milestone: MilestoneType, username?: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Brand gradient background (coral to orange)
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, '#ff8f6b'); // lighter coral
    gradient.addColorStop(1, '#ff6f3b'); // primary orange
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Add subtle radial overlay for depth
    const radialGradient = ctx.createRadialGradient(540, 400, 0, 540, 540, 600);
    radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    radialGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, 1080, 1080);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    const config = MILESTONE_CONFIG[milestone];

    if (milestone === 'challenge_complete') {
      // Challenge complete layout
      ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
      ctx.fillText('🎉 ONE HELLO 🎉', 540, 180);

      ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
      ctx.fillText('30-DAY CHALLENGE', 540, 320);
      ctx.fillText('COMPLETE', 540, 400);

      ctx.font = '44px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✓ 30 challenges mastered', 280, 540);
      ctx.fillText('✓ Countless conversations', 280, 610);
      ctx.fillText('✓ Real connections made', 280, 680);

      ctx.textAlign = 'center';
      ctx.font = 'italic 40px Georgia, serif';
      ctx.fillText('"From stranger to friend,', 540, 800);
      ctx.fillText('one hello at a time"', 540, 860);

      ctx.font = '36px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('onehellosoon.com', 540, 1000);
    } else {
      // Hellos milestone layout
      // Raccoon emoji
      ctx.font = '140px system-ui, -apple-system, sans-serif';
      ctx.fillText('🦝', 540, 200);

      // App name
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      ctx.fillText('ONE HELLO', 540, 290);

      // Milestone number (BIG)
      ctx.font = 'bold 220px system-ui, -apple-system, sans-serif';
      ctx.fillText(config.count.toString(), 540, 540);

      // "HELLOS LOGGED" or username version
      ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
      if (username && username !== 'Guest' && username !== 'Friend') {
        ctx.fillText(`HELLOS BY ${username.toUpperCase()}`, 540, 620);
      } else {
        ctx.fillText('HELLOS LOGGED', 540, 620);
      }

      // Quote
      ctx.font = 'italic 40px Georgia, serif';
      const quoteLines = config.quote.split('\n');
      quoteLines.forEach((line, i) => {
        ctx.fillText(`"${line}"`, 540, 750 + i * 60);
      });

      // URL
      ctx.font = '36px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText('onehellosoon.com', 540, 1000);
    }

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image'));
        }
      },
      'image/png',
      1
    );
  });
}

export function getTwitterShareText(milestone: MilestoneType): string {
  const config = MILESTONE_CONFIG[milestone];

  if (milestone === 'challenge_complete') {
    return `Just completed the 30-Day Hello Challenge! 🎉\n\n30 ways to start conversations - mastered.\n\nReconnecting the world, one hello at a time 🦝\n\nonehellosoon.com`;
  }

  return `Just logged my ${config.count}${getOrdinalSuffix(config.count)} hello with @OneHelloApp 🦝\n\nReconnecting the world, one hello at a time.\n\nonehellosoon.com`;
}

export async function downloadShareImage(blob: Blob, milestone: MilestoneType): Promise<void> {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `onehello-${milestone.replace('_', '-')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText('onehellosoon.com');
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = 'onehellosoon.com';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}

export async function shareNative(blob: Blob, milestone: MilestoneType): Promise<boolean> {
  if (!navigator.canShare) return false;

  const file = new File([blob], `onehello-${milestone}.png`, { type: 'image/png' });

  if (!navigator.canShare({ files: [file] })) return false;

  try {
    await navigator.share({
      files: [file],
      title: 'My One Hello Achievement',
      text: 'Check out my One Hello achievement! 🦝 onehellosoon.com',
    });
    return true;
  } catch {
    return false;
  }
}

export function shareToTwitter(milestone: MilestoneType): void {
  const text = getTwitterShareText(milestone);
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(tweetUrl, '_blank');
}
