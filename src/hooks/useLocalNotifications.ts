import { useCallback, useEffect, useRef } from 'react';
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useLocalStorage } from './useLocalStorage';

// Notification IDs
const NOTIFICATION_ID_MORNING = 1;
const NOTIFICATION_ID_AFTERNOON = 2;
const NOTIFICATION_ID_WEEKLY = 3;

// Morning messages (9am daily for Daily Mode users)
const morningMessages = [
  { title: "One Hello a day keeps the doctor away 👨‍⚕️", body: "Time to log your daily hello!" },
  { title: "Met anyone cool lately?", body: "Store them in here so you don't forget" },
  { title: "Let's make someone's day", body: "One Hello is all it takes 🦝" },
  { title: "I once said hello and made a friend", body: "Just saying 🦝" },
  { title: "Furry reminder", body: "Say your One Hello today" },
  { title: "99% of people light up", body: "When a stranger is simply kind." },
  { title: "The world is full of people", body: "Waiting for someone to say hello first." },
  { title: "The smallest act of courage", body: "Can change someone's entire day." },
  { title: "Your future best friend", body: "Is currently a stranger." },
  { title: "A name remembered", body: "Is a heart acknowledged." },
  { title: "Life is meaningless without connection", body: "Go make one today, however big or small." },
  { title: "The world is waiting", body: "For someone to make the first move. Today, that's you." },
  { title: "If it scares you a little", body: "It's probably worth doing." },
  { title: "Saying hello is free", body: "But the pay off is infinite" },
  { title: "You miss 100% of the connections", body: "You don't initiate." },
  { title: "A small hello", body: "Can change someone's entire day." },
  { title: "Let's reconnect the world", body: "One Hello at a time" },
];

// Afternoon messages (3pm for Daily Mode users with streak >= 1, only if no hello logged today)
const afternoonMessages = [
  { title: "Time flies", body: "Don't forget to say your One Hello today :-)" },
  { title: "Have you logged your hello today?", body: "🦝" },
  { title: "Hello-icopter coming in for landing", body: "🚁" },
  { title: "Your streak is still alive!", body: "One Hello is all it takes" },
  { title: "It's not too late", body: "Come say hello and keep that streak going" },
  { title: "Your streak lives on", body: "But I can't hold it any longer, come say hello!" },
  { title: "One hello could brighten your day", body: "Plus it's free 🤷‍♂️" },
  { title: "Any Hellos you want to tell me about?", body: "🦝" },
  { title: "3pm already?!", body: "Time to log a hello to save your streak" },
  { title: "Hello... it's me", body: "(Reminder Raccoon)" },
];

// Weekly messages (for users with Daily Mode OFF)
const weeklyMessages = [
  { title: "Any Hellos you want to tell me about?", body: "🦝" },
  { title: "Remi here", body: "Furry reminder to say Hello" },
  { title: "Meet anyone new lately?", body: "Store their name in here so you don't forget" },
  { title: "One Hello is all it takes", body: "Give it a try" },
  { title: "Hey it's been a while", body: "Come say hello" },
];

function getRandomMessage(messages: { title: string; body: string }[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

export interface NotificationPreferences {
  enabled: boolean;
  morningTime: number; // Hour (0-23)
  afternoonTime: number; // Hour (0-23)
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  morningTime: 9,
  afternoonTime: 15,
};

export const useLocalNotifications = () => {
  const [preferences, setPreferences] = useLocalStorage<NotificationPreferences>(
    'notification_prefs',
    DEFAULT_PREFS
  );
  const [hasRequestedPermission, setHasRequestedPermission] = useLocalStorage<boolean>(
    'notification_permission_requested',
    false
  );
  
  const isNativePlatform = Capacitor.isNativePlatform();
  const initializingRef = useRef(false);

  // Request permission on first launch
  useEffect(() => {
    if (!isNativePlatform || hasRequestedPermission || initializingRef.current) return;
    
    const requestOnFirstLaunch = async () => {
      initializingRef.current = true;
      try {
        console.log('[Notifications] Requesting permission on first launch');
        const permission = await LocalNotifications.requestPermissions();
        console.log('[Notifications] Permission result:', permission.display);
        setHasRequestedPermission(true);
      } catch (error) {
        console.error('[Notifications] Error requesting permission on first launch:', error);
      } finally {
        initializingRef.current = false;
      }
    };

    requestOnFirstLaunch();
  }, [isNativePlatform, hasRequestedPermission, setHasRequestedPermission]);

  // Check and request permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isNativePlatform) {
      console.log('[Notifications] Not a native platform, skipping');
      return false;
    }

    try {
      const currentPermission = await LocalNotifications.checkPermissions();
      
      if (currentPermission.display === 'granted') {
        return true;
      }

      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      return false;
    }
  }, [isNativePlatform]);

  // Cancel all notifications
  const cancelAllNotifications = useCallback(async () => {
    if (!isNativePlatform) return;

    try {
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_ID_MORNING },
          { id: NOTIFICATION_ID_AFTERNOON },
          { id: NOTIFICATION_ID_WEEKLY },
        ],
      });
      console.log('[Notifications] Cancelled all notifications');
    } catch (error) {
      console.error('[Notifications] Error cancelling notifications:', error);
    }
  }, [isNativePlatform]);

  // Cancel afternoon notification specifically (when user logs a hello)
  const cancelAfternoonNotification = useCallback(async () => {
    if (!isNativePlatform) return;

    try {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIFICATION_ID_AFTERNOON }],
      });
      console.log('[Notifications] Cancelled afternoon notification');
    } catch (error) {
      console.error('[Notifications] Error cancelling afternoon notification:', error);
    }
  }, [isNativePlatform]);

  // Schedule morning notification (9am daily)
  const scheduleMorningNotification = useCallback(async () => {
    if (!isNativePlatform) return;

    const message = getRandomMessage(morningMessages);
    
    const notification: LocalNotificationSchema = {
      id: NOTIFICATION_ID_MORNING,
      title: message.title,
      body: message.body,
      schedule: {
        on: {
          hour: preferences.morningTime,
          minute: 0,
        },
        repeats: true,
        allowWhileIdle: true,
      },
      sound: 'default',
      actionTypeId: 'OPEN_APP',
    };

    try {
      await LocalNotifications.schedule({
        notifications: [notification],
      });
      console.log('[Notifications] Scheduled morning notification at', preferences.morningTime);
    } catch (error) {
      console.error('[Notifications] Error scheduling morning notification:', error);
    }
  }, [isNativePlatform, preferences.morningTime]);

  // Schedule afternoon notification (3pm daily for users with streak)
  const scheduleAfternoonNotification = useCallback(async () => {
    if (!isNativePlatform) return;

    const message = getRandomMessage(afternoonMessages);
    
    const notification: LocalNotificationSchema = {
      id: NOTIFICATION_ID_AFTERNOON,
      title: message.title,
      body: message.body,
      schedule: {
        on: {
          hour: preferences.afternoonTime,
          minute: 0,
        },
        repeats: true,
        allowWhileIdle: true,
      },
      sound: 'default',
      actionTypeId: 'OPEN_APP',
    };

    try {
      await LocalNotifications.schedule({
        notifications: [notification],
      });
      console.log('[Notifications] Scheduled afternoon notification at', preferences.afternoonTime);
    } catch (error) {
      console.error('[Notifications] Error scheduling afternoon notification:', error);
    }
  }, [isNativePlatform, preferences.afternoonTime]);

  // Schedule weekly notification (random day, 10am for users with Daily Mode OFF)
  const scheduleWeeklyNotification = useCallback(async () => {
    if (!isNativePlatform) return;

    const message = getRandomMessage(weeklyMessages);
    const randomDay = Math.floor(Math.random() * 7) + 1; // 1-7 (Sunday-Saturday)
    
    const notification: LocalNotificationSchema = {
      id: NOTIFICATION_ID_WEEKLY,
      title: message.title,
      body: message.body,
      schedule: {
        on: {
          weekday: randomDay,
          hour: 10,
          minute: 0,
        },
        repeats: true,
        allowWhileIdle: true,
      },
      sound: 'default',
      actionTypeId: 'OPEN_APP',
    };

    try {
      await LocalNotifications.schedule({
        notifications: [notification],
      });
      console.log('[Notifications] Scheduled weekly notification on day', randomDay);
    } catch (error) {
      console.error('[Notifications] Error scheduling weekly notification:', error);
    }
  }, [isNativePlatform]);

  // Main scheduling function based on Daily Mode state
  const scheduleNotifications = useCallback(async (
    dailyModeActive: boolean,
    currentStreak: number
  ) => {
    if (!isNativePlatform) {
      console.log('[Notifications] Not a native platform, skipping schedule');
      return;
    }

    if (!preferences.enabled) {
      console.log('[Notifications] Notifications disabled, cancelling all');
      await cancelAllNotifications();
      return;
    }

    const hasPermission = await requestPermission();
    if (!hasPermission) {
      console.log('[Notifications] Permission not granted');
      return;
    }

    // Cancel existing notifications first
    await cancelAllNotifications();

    if (dailyModeActive) {
      // Schedule morning notification (always for Daily Mode users)
      await scheduleMorningNotification();

      // Only schedule afternoon if user has a streak (risk of losing it)
      if (currentStreak >= 1) {
        await scheduleAfternoonNotification();
      }
    } else {
      // Daily Mode OFF - schedule weekly notification
      await scheduleWeeklyNotification();
    }
  }, [
    isNativePlatform,
    preferences.enabled,
    requestPermission,
    cancelAllNotifications,
    scheduleMorningNotification,
    scheduleAfternoonNotification,
    scheduleWeeklyNotification,
  ]);

  // Handle hello logged - cancel afternoon notification for today
  const onHelloLogged = useCallback(async (
    dailyModeActive: boolean,
    currentStreak: number,
    todaysHelloCount: number
  ) => {
    if (!isNativePlatform || !dailyModeActive) return;

    // If this is the first hello of the day, cancel afternoon notification
    if (todaysHelloCount >= 1) {
      await cancelAfternoonNotification();
      
      // Reschedule for tomorrow (if user has streak)
      if (currentStreak >= 1) {
        await scheduleAfternoonNotification();
      }
    }
  }, [isNativePlatform, cancelAfternoonNotification, scheduleAfternoonNotification]);

  // Handle streak changes
  const onStreakChange = useCallback(async (
    newStreak: number,
    oldStreak: number,
    dailyModeActive: boolean
  ) => {
    if (!isNativePlatform || !dailyModeActive) return;

    // Streak just started (0 → 1+) - add afternoon notification
    if (oldStreak === 0 && newStreak >= 1) {
      await scheduleAfternoonNotification();
    }

    // Streak just broke (1+ → 0) - remove afternoon notification
    if (oldStreak >= 1 && newStreak === 0) {
      await cancelAfternoonNotification();
    }
  }, [isNativePlatform, scheduleAfternoonNotification, cancelAfternoonNotification]);

  // Handle Daily Mode toggle
  const onDailyModeToggle = useCallback(async (
    isEnabled: boolean,
    currentStreak: number
  ) => {
    await scheduleNotifications(isEnabled, currentStreak);
  }, [scheduleNotifications]);

  // Update preferences
  const updatePreferences = useCallback(async (
    newPrefs: Partial<NotificationPreferences>,
    dailyModeActive: boolean,
    currentStreak: number
  ) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    // Reschedule notifications with new preferences
    if (updated.enabled) {
      await scheduleNotifications(dailyModeActive, currentStreak);
    } else {
      await cancelAllNotifications();
    }
  }, [preferences, setPreferences, scheduleNotifications, cancelAllNotifications]);

  // Set up notification tap listener
  useEffect(() => {
    if (!isNativePlatform) return;

    const setupListener = async () => {
      try {
        await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('[Notifications] Notification tapped:', notification);
          // The app will open automatically, no additional action needed
        });
      } catch (error) {
        console.error('[Notifications] Error setting up listener:', error);
      }
    };

    setupListener();

    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, [isNativePlatform]);

  return {
    isNativePlatform,
    preferences,
    requestPermission,
    scheduleNotifications,
    cancelAllNotifications,
    cancelAfternoonNotification,
    onHelloLogged,
    onStreakChange,
    onDailyModeToggle,
    updatePreferences,
  };
};
