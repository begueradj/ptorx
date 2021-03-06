import { deleteAlias } from 'lib/aliases/delete';
import { getDomainUser } from 'lib/domains/users/get';
import { Ptorx } from 'types/ptorx';
import { MySQL } from 'lib/MySQL';

export async function deleteDomainUser(
  domainId: Ptorx.Domain['id'],
  /** UUID key of the user to remove */
  domainUserKey: Ptorx.DomainUser['requestKey'],
  /** User id of the _domain owner_ */
  userId: number
): Promise<void> {
  const db = new MySQL();
  try {
    const domainUser = await getDomainUser(domainId, domainUserKey, userId);
    if (domainUser.userId == userId) throw 'You cannot delete yourself';

    await db.query(
      `
        DELETE FROM domain_users WHERE userId = ? AND domainId IN (
          SELECT id FROM domains WHERE id = ? AND userId = ?
        )
      `,
      [domainUser.userId, domainId, userId]
    );

    const aliases: { id: Ptorx.Alias['id'] }[] = await db.query(
      'SELECT id FROM aliases WHERE userId = ? AND domainId = ?',
      [domainUser.userId, domainId]
    );
    for (let alias of aliases) {
      await deleteAlias(alias.id, domainUser.userId);
    }
    db.release();
  } catch (err) {
    db.release();
    throw err;
  }
}
