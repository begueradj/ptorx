import { NextFunction, Response, Request } from 'express';
import { verifyPrimaryEmail } from 'lib/primary-emails/verify';

export function api_verifyPrimaryEmail(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  verifyPrimaryEmail(
    +req.query.primaryEmailId,
    req.query.primaryEmailKey,
    req.jwt.userId
  )
    .then(() =>
      res
        .status(200)
        .redirect(`/app/primary-emails/${+req.query.primaryEmailId}`)
    )
    .catch(next);
}
