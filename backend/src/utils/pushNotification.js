import webpush from 'web-push';

const subscriptions = new Map();

// Set VAPID keys
webpush.setVapidDetails(
  'mailto: afnan.mumu@welldev.io',
  'BDdTbQklov4-VHiMt6DUds3U6SuWSRi8dhzgYBFOrlkJbR3oFE48-3XDR2xkviruCUvsYEqgAa2VMp1AxYxyMlE',
  'Q6NbQq-17Npkl2bm4nYx5I_HjSWJc_3fJYKsLThFCFA'
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
