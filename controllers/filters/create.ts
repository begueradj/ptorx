﻿import escapeRegExp = require("escape-string-regexp");
import validate = require("../../lib/filter/validate");
import db = require("../../lib/db");

/*
    POST api/filters
    REQUIRED
        type: number, name: string, description: string, find: string
    OPTIONAL
        acceptOnMatch: boolean, useRegex: boolean
    RETURN
        { error: boolean, message?: string, id?: number }
    DESCRIPTION
        Create a new filter
*/
export = function (req, res) {

    let response = validate(req.body);

    if (response != "ok") {
        res.json({ error: true, message: response });
        return;
    }

    if (!req.body.useRegex)
        req.body.find = escapeRegExp(req.body.find);

    let insert = {
        user_id: req.session.uid, name: req.body.name, description: req.body.description,
        type: req.body.type, find: req.body.find, use_regex: !!(+req.body.useRegex),
        accept_on_match: !!(+req.body.acceptOnMatch)
    };

    let sql: string = `
        INSERT INTO filters SET ?
    `;
    db(cn => cn.query(sql, insert, (err, result) => {
        cn.release();

        if (err || !result.affectedRows)
            res.json({ error: true, message: "An unknown error occured" });
        else
            res.json({ error: false, id: result.insertId });
    }));

};