import confetti from 'canvas-confetti';

export function celebrateFavoriteMilestone(): void {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  void confetti({
    particleCount: 55,
    spread: 65,
    startVelocity: 28,
    origin: { y: 0.72 },
    scalar: 0.8,
    ticks: 120,
  });
}
