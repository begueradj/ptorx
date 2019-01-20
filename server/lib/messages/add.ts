import { editMessage } from 'lib/messages/edit';
import { getMessage } from 'lib/messages/get';
import * as moment from 'moment';
import { Ptorx } from 'typings/ptorx';
import { MySQL } from 'lib/MySQL';
import * as uuid from 'uuid/v4';

export async function addMessage(
  message: Partial<Ptorx.Message>,
  userId: number
): Promise<Ptorx.Message> {
  const db = new MySQL();
  try {
    const insert: Partial<Ptorx.Message> = {
      key: uuid(),
      created: moment().unix(),
      proxyEmailId: message.proxyEmailId
    };
    const result = await db.query('INSERT INTO messages SET ?', insert);
    const _message = await getMessage(result.insertId, userId);
    return await editMessage({ ..._message, ...message }, userId);
  } catch (err) {
    db.release();
    throw err;
  }
}
