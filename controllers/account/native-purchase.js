const request = require("request");
const iap = require("in-app-purchase");
const db = require("lib/db");

const config = require("config");

function setSubscription(subscription, days) {
    return Date.now() > subscription
        ? (Date.now() + ((60 * 60 * 24 * days) * 1000))
        : (subscription + ((60 * 60 * 24 * days) * 1000));
}

function applySubscriptions(purchases) {
    const subscriptions = {
        "com.xyfir.ptorx.premium.30-days": 30,
        "com.xyfir.ptorx.premium.182-days": 182,
        "com.xyfir.ptorx.premium.365-days": 365
    };

    let sql  = "SELECT subscription FROM users WHERE user_id = ?",
        vars = [req.session.uid];

    db(cn => cn.query(sql, vars, (err, rows) => {
        if (err || !rows.length) throw "Please contact support";

        let subscription = rows[0].subscription;

        // Get subscription time from product id
        // Update subscription expiration date
        purchases.forEach(purchase => {
            subscription = setSubscription(
                subscription, subscriptions[purchase.productId] || 0
            );
        });

        // Apply new subscription expiration date to user's account
        sql  = "UPDATE users SET subscription = ? WHERE user_id = ?",
        vars = [subscription, req.session.uid];

        cn.query(sql, vars, (err, response) => {
            cn.release();
            
            if (err || !response.affectedRows)
                throw "Please contact support";
            else
                res.json({ error: false });
        });
    }));
}

/*
    POST api/account/native-purchase
    REQUIRED
        transactionId, receipt, signature, productType
    RETURN
        { error: boolean, message?: string }
    DESCRIPTION
        Validate purchase recepit and add months to user's subscription
*/
module.exports = function(req, res) {

    let data;

    // Signature property is empty string if from Apple
    const store = !req.body.signature
        ? iap.APPLE : iap.GOOGLE;

    // Set data to validate
    if (store == iap.APPLE) {
        data = req.body.receipt;
    }
    else {
        if (config.environment.type == "prod") {
            iap.config({
                googlePublicKeyStrLive: config.keys.playStore
            });
        }
        else {
            iap.config({
                googlePublicKeyStrSandBox: config.keys.playStore
            });
        }

        data = {
            receipt: req.body.receipt, signature: req.body.signature
        };
    }

    // Validate receipt
    try {
        iap.setup(err => {
            if (err) throw "Could not validate purchase";

            iap.validate(store, data, (err, response) => {
                if (err)
                    throw "Could not validate purchase";
                if (!iap.isValidated(response))
                    throw "Invalid purchase receipt received";
                
                applySubscriptions(iap.getPurchaseData(response));
            });
        });
    }
    catch (e) {
        res.json({ error: true, message: e });
    }

};