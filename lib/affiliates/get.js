const moment = require('moment');
const MySQL = require('lib/mysql');

/**
 * @typedef {object} Affiliate
 * @prop {number} user_id
 * @prop {string} api_key
 * @prop {number} subscriptions
 * @prop {number} discount
 * @prop {string} last_payment
 * @prop {number} owed
 * @prop {string} timestamp
 * @prop {number} unpaid_subscriptions
 */
/**
 * @async
 * @param {object} db
 * @param {string} user
 * @param {string} timestamp
 * @return {Affiliate}
 */
module.exports = async function(db, user, timestamp) {
  const [affiliate] = await db.query(
    'SELECT * FROM affiliates WHERE user_id = ?',
    [user]
  );
  if (!affiliate) throw 'You are not an affiliate';

  affiliate.timestamp = timestamp;
  affiliate.last_payment = moment(affiliate.last_payment).format(
    'YYYY-MM-DD HH:mm:ss'
  );
  const [{ unpaid_subscriptions }] = await db.query(
    `
      SELECT COUNT(user_id) AS unpaid_subscriptions
      FROM affiliate_created_users
      WHERE affiliate_id = ? AND created_at > ? AND created_at <= ?
    `,
    [user, affiliate.last_payment, affiliate.timestamp]
  );
  affiliate.unpaid_subscriptions = unpaid_subscriptions;

  affiliate.owed = +(
    unpaid_subscriptions *
    (9.99 - affiliate.discount / 100)
  ).toFixed(2);

  return affiliate;
};