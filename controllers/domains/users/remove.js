const deleteEmail = require('controllers/emails/delete');
const mysql = require('lib/mysql');

/*
  DELETE api/domains/:domain/users/:user
  RETURN
    { error: boolean, message?: string }
  DESCRIPTION
    Allows a user to remove a domain from their account or a domain creator
    to remove a user from the domain.
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();

    let result;

    // Remove self from domain
    if (req.params.user == req.session.uid) {
      result = await db.query(
        'DELETE FROM domain_users WHERE domain_id = ? AND user_id = ?',
        [req.params.domain, req.params.user]
      );
    }
    // Remove another user from domain
    else {
      result = await db.query(`
        DELETE FROM domain_users WHERE user_id = ? AND domain_id IN (
          SELECT id FROM domains WHERE id = ? AND user_id = ?
        )
      `, [
        req.params.user,
        req.params.domain, req.session.uid
      ])
    }

    if (!result.affectedRows) throw 'Could not remove from domain';

    // Get all of user's proxy emails on this domain
    const emails = await db.query(`
      SELECT email_id AS id FROM redirect_emails
      WHERE user_id = ? AND domain_id = ?
    `, [
      req.params.user, req.params.domain
    ]);
    db.release();

    // Delete emails
    for (let email of emails) {
      await deleteEmail(
        { params: { email: email.id }, session: { uid: req.params.user } },
        { json: () => 1 }
      );
    }

    res.json({ error: false });
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};