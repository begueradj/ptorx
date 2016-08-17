﻿const db = require("lib/db");

/*
    PUT api/account/subscription
    REQUIRED
        stripeToken: string, months: number
    RETURN
        { error: boolean, message: string }
    DESCRIPTION
        Add months to user's subscription after charging card via Stripe
*/
module.exports = function(req, res) {

    let stripeKey = require("../../config").keys.stripe;
    let amount = [0, 3, 15, 24][req.body.months] * 100;

    if (!amount) {
        res.json({ error: true, message: "Invalid subscription length" });
        return;
    }

    let months = [0, 1, 6, 12][req.body.months];

    let info = {
        amount, currency: "usd", source: req.body.stripeToken,
        description: "Ptorx - Premium Subscription"
    };

    require("stripe")(stripeKey).charges.create(info, (err, charge) => {
        if (err) {
            res.json({ error: true, message: "Error processing your card. Please try again." });
            return;
        }

        let sql = `
            SELECT subscription FROM users WHERE user_id = ?
        `;
        db(cn => cn.query(sql, [req.session.uid], (err, rows) => {
            if (err || !rows.length) {
                cn.release();
                res.json({ error: true, message: "An unknown error occured" });
            }
            else {
                // Add months to current subscription expiration (or now())
                let subscription = rows[0].subscription == 0
                    ? (Date.now() + (months * 30 * 86400 * 1000))
                    : (rows[0].subscription + (months * 30 * 86400 * 1000));

                sql = `
                    UPDATE users SET subscription = ? WHERE user_id = ?
                `;
                cn.query(sql, [subscription, req.session.uid], (err, result) => {
                    cn.release();
                    
                    req.session.subscription = subscription;
                    res.json({ error: false, message: "" });
                });
            }
        }));
    });

};