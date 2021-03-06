import 'lib/tests/prepare';
import { verifyPrimaryEmail } from 'lib/primary-emails/verify';
import { deletePrimaryEmail } from 'lib/primary-emails/delete';
import { listPrimaryEmails } from 'lib/primary-emails/list';
import { editPrimaryEmail } from 'lib/primary-emails/edit';
import { getPrimaryEmail } from 'lib/primary-emails/get';
import { addPrimaryEmail } from 'lib/primary-emails/add';
import { captureMail } from 'lib/tests/capture-mail';
import { Ptorx } from 'types/ptorx';

test('create primary email', async () => {
  expect.assertions(13);

  const promise = captureMail(1, message => {
    expect(message.subject).toBe('Verify your email for Ptorx');
    expect(message.from.text).toBe(`noreply-x@${process.enve.DOMAIN}`);
    expect(message.to.text).toBe('test@example.com');
    expect(message.html).toMatch(/Verify Primary Email/);
    expect(message.text).toMatch(/Verify Primary Email/);
  });

  const primaryEmail = await addPrimaryEmail(
    { address: 'test@example.com' },
    1234
  );
  expect(Object.keys(primaryEmail).length).toBe(7);
  expect(primaryEmail.id).toBeNumber();
  expect(primaryEmail.created).toBeNumber();
  expect(primaryEmail.userId).toBe(1234);
  expect(primaryEmail.address).toBe('test@example.com');
  expect(primaryEmail.verified).toBeFalse();
  expect(primaryEmail.key).toHaveLength(36);
  expect(primaryEmail.autolink).toBeFalse();

  await promise;
});

test('list primary emails', async () => {
  const primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails).toBeArrayOfSize(1);
  const keys: Array<keyof Ptorx.PrimaryEmailList[0]> = [
    'id',
    'userId',
    'address',
    'created',
    'verified',
    'autolink'
  ];
  expect(primaryEmails[0]).toContainAllKeys(keys);
});

test('verify primary email', async () => {
  const primaryEmails = await listPrimaryEmails(1234);
  const primaryEmail = await getPrimaryEmail(primaryEmails[0].id, 1234);
  await expect(verifyPrimaryEmail(primaryEmail.id, 'nope', 1234)).toReject();
  await expect(
    verifyPrimaryEmail(primaryEmail.id, primaryEmail.key, 1234)
  ).not.toReject();
  const _primaryEmail = await getPrimaryEmail(primaryEmail.id, 1234);
  await expect(_primaryEmail.verified).toBeTrue();
});

test('edit primary email', async () => {
  const [primaryEmail] = await listPrimaryEmails(1234);
  const _primaryEmail = await editPrimaryEmail(
    { ...primaryEmail, autolink: true },
    1234
  );
  expect(_primaryEmail.autolink).toBeTrue();
});

test('delete primary emails', async () => {
  let primaryEmails = await listPrimaryEmails(1234);
  const [primaryEmail] = primaryEmails;
  await deletePrimaryEmail(primaryEmail.id, 1234);
  primaryEmails = await listPrimaryEmails(1234);
  expect(primaryEmails).toBeArrayOfSize(0);
  expect(primaryEmails.find(m => m.id == primaryEmail.id)).toBeUndefined();
});
