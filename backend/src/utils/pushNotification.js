import webpush from 'web-push';

const subscriptions = new Map();

// Set VAPID keys
webpush.setVapidDetails(
  'mailto: afnan.mumu@welldev.io',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Save a subscription for a user
 * @param {string} userId - The user's ID
 * @param {Object} subscription - The subscription object
 */
export const saveSubscription = (userId, subscription) => {
  if (!userId || !subscription) {
    throw new Error('Invalid userId or subscription');
  }

  subscriptions.set(userId, subscription);
  //   console.log(`Subscription saved for user: ${userId}`);
};

/**
 * Send a push notification to a user
 * @param {string} userId - The user's ID
 * @param {Object} payload - The notification payload
 * @returns {Promise<void>}
 */
export const sendPushNotification = async (userId, payload) => {
  //   console.log(`Type of userId: ${typeof userId}`);
  //   if()
  if (!subscriptions.has(userId)) {
    // console.error(`No subscription found for user: ${userId}`);
    return;
  }

  const subscription = subscriptions.get(userId);

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    // console.log(`Push notification sent to user: ${userId}`);
  } catch (error) {
    // console.error(`Failed to send push notification to user: ${userId}`, error);
  }
};
