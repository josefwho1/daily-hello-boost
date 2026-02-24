/** Haptic feedback utility using the Vibration API */

/** Short tap — hello logged */
export const vibrateSuccess = () => {
  try {
    navigator?.vibrate?.(40);
  } catch {}
};

/** Double pulse — challenge complete */
export const vibrateCelebration = () => {
  try {
    navigator?.vibrate?.([40, 60, 80]);
  } catch {}
};
