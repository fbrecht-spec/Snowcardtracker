import confetti from 'canvas-confetti';

/**
 * Kurzes haptisches Feedback.
 * Android: Vibration API. iOS (Safari 18+): Umschalten eines versteckten <input switch>
 * löst die System-Haptik aus – die Web-Vibration-API gibt es auf dem iPhone nicht.
 * Muss direkt aus einem Tipp/Klick heraus aufgerufen werden.
 */
export const haptic = () => {
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(10);
      return;
    }
    const label = document.createElement('label');
    label.ariaHidden = 'true';
    label.style.display = 'none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    label.appendChild(input);
    document.body.appendChild(label);
    label.click();
    label.remove();
  } catch {
    /* Haptik ist optional */
  }
};

export const celebrate = () => {
  const colors = ['#007AFF', '#34C759', '#5AC8FA', '#FFCC00', '#FFFFFF'];
  const base = { particleCount: 70, spread: 70, startVelocity: 45, colors, disableForReducedMotion: true, zIndex: 200 };
  confetti({ ...base, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });
};
