import webpush from 'web-push';

import { User } from '../models/user.model.js';

class PushNotificationService {
  constructor() {
    webpush.setVapidDetails(
      'mailto:afnan.mumu@welldev.io',
      'BDThbjZw_ttSZjCW_uClXO5SR-V8W_sK2wAXBnQ37t11DUmvQhwJOUpURzYOCi4yfK4ZchFzo0ZNBanrjj5AFnM',
      'odcnjDxa_-qmdW3F05H3m-Pvh7WdOuC05EXPLXlVyws'
    );
    this.subscriptions = new Map();
  }

  addSubscription(userId, subscription) {
    this.subscriptions.set(userId, subscription);
  }

  removeSubscription(userId) {
    this.subscriptions.delete(userId);
  }

  async sendNotification(userId, payload) {
    try {
      const subscription = this.subscriptions.get(userId);
      if (!subscription) {
        return { success: false, error: 'No subscription found for user' };
      }

      const result = await webpush.sendNotification(
        subscription,
        JSON.stringify(payload)
      );
      return { success: true, result };
    } catch (error) {
      console.error('Push notification error:', error);
      if (error.statusCode === 410) {
        this.removeSubscription(userId);
      }
      return { success: false, error: error.message };
    }
  }
}

export default new PushNotificationService();
