const mysql = require('lib/mysql');

/*
  GET api/modifiers/:mod
  RETURN
    {
      error: boolean, message?: string,
      id: number, name: string, description: string, type: number
      data: json-string, linkedTo: [{ id: number, address: string }]
    }
  DESCRIPTION
    Returns data and linkedTo for a specific modifier
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [modifier] = await db.query(`
      SELECT
        modifier_id AS id, name, description, type, data
      FROM modifiers
      WHERE modifier_id = ? AND user_id = ?
    `, [
      req.params.mod, req.session.uid
    ]);

    if (!modifier) throw 'Could not find modifier';

    modifier.error = false;

    modifier.linkedTo = await db.query(`
    SELECT
      email_id AS id, CONCAT(re.address, '@', d.domain) AS address
    FROM
      redirect_emails AS re, domains AS d
    WHERE
      re.email_id IN (
        SELECT email_id FROM linked_modifiers WHERE modifier_id = ?
      ) AND d.id = re.domain_id
    `, [
      req.params.mod
    ]);
    db.release();

    res.json(modifier);
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: string });
  }

};