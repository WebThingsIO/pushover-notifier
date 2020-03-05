const fetch = require('node-fetch');
const manifest = require('./manifest.json');

const {
  Constants,
  Notifier,
  Outlet,
} = require('gateway-addon');

/**
 * A Pushover outlet
 */
class PushoverOutlet extends Outlet {
  /**
   * @param {PushoverNotifier} notifier
   * @param {string} id - A globally unique identifier
   */
  constructor(notifier, id, config) {
    super(notifier, id);
    this.name = 'Pushover';
    this.config = config;
  }

  async notify(title, message, level) {
    let priority = 0;

    switch (level) {
      case Constants.NotificationLevel.LOW:
        priority = -1;
        break;
      case Constants.NotificationLevel.NORMAL:
        priority = 0;
        break;
      case Constants.NotificationLevel.HIGH:
        priority = 1;
        break;
    }

    const body = {
      token: this.config.token,
      user: this.config.userKey,
      title,
      message,
      priority,
    };

    // Let errors bubble up to gateway
    await fetch('https://api.pushover.net/1/messages.json', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to post message: ${res.statusText}`);
      }
    });
  }
}

/**
 * Pushover Notifier
 *
 * Instantiates one Pushover outlet
 */
class PushoverNotifier extends Notifier {
  constructor(addonManager, config) {
    super(addonManager, 'pushover', manifest.id);

    addonManager.addNotifier(this);

    if (!this.outlets['pushover-0']) {
      this.handleOutletAdded(
        new PushoverOutlet(this, 'pushover-0', config)
      );
    }
  }
}

module.exports = PushoverNotifier;
