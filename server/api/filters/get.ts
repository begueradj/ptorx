import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getFilter(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const [filter] = await db.query(
      `
      SELECT
        filter_id AS id, name, description, type, find,
        accept_on_match as acceptOnMatch, use_regex AS regex
      FROM filters
      WHERE filter_id = ? AND user_id = ?
    `,
      [req.params.filter, req.session.uid]
    );

    if (!filter) throw 'Could not find filter';

    filter.regex = !!+filter.regex;
    filter.acceptOnMatch = !!+filter.acceptOnMatch;

    filter.linkedTo = await db.query(
      `
      SELECT
        email_id AS id, CONCAT(pxe.address, '@', d.domain) AS address
      FROM
        proxy_emails AS pxe, domains AS d
      WHERE
        pxe.email_id IN (
          SELECT email_id FROM linked_filters WHERE filter_id = ?
        ) AND d.id = pxe.domain_id
    `,
      [req.params.filter]
    );
    db.release();

    res.status(200).json(filter);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
