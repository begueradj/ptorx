import { editDomain } from 'lib/domains/edit';
import { resolveTxt } from 'dns';
import { getDomain } from 'lib/domains/get';
import { Ptorx } from 'typings/ptorx';

export async function verifyDomain(
  domainId: Ptorx.Domain['id'],
  userId: number
): Promise<void> {
  try {
    const domain = await getDomain(domainId, userId);
    const records: string[][] | Error = await new Promise(resolve =>
      resolveTxt(
        `${domain.selector}._domainkey.${domain.domain}`,
        (err, records) => resolve(err || records)
      )
    );
    if (
      !Array.isArray(records) ||
      records.findIndex(a => a.findIndex(b => b == domain.publicKey) > -1) == -1
    )
      throw 'Domain could not be verified';
    await editDomain({ ...domain, verified: true }, userId);
  } catch (err) {
    throw err;
  }
}
