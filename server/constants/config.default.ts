import { SMTPServerOptions } from 'smtp-server';
import { readFileSync } from 'fs';

export const PROD = false;

export const CRON = false;

export const MYSQL = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  charset: 'UTF8MB4_UNICODE_CI',
  password: '',
  database: 'ptorx',
  dateStrings: true,
  connectionLimit: 100,
  supportBigNumbers: true,
  waitForConnections: true
};

export const TESTS = {
  PERSISTENT_DOMAIN_NAME: '',
  PERSISTENT_PROXY_EMAIL: '',
  PERSISTENT_DOMAIN_ID: 1,
  SMTP_PORT: 2072
};

export const API_PORT = 2070;

export const SMTP_PORT = 2071;

export const PTORX_URL = 'http://localhost:2070';

export const XYPAYMENTS_ID = 13;

export const XYPAYMENTS_URL = 'http://localhost:2062';

export const XYPAYMENTS_KEY = '';

export const SESSION_SECRET = '';

export const XYACCOUNTS_KEY = '';

export const XYACCOUNTS_URL = 'http://localhost:2000';

export const ACCESS_TOKEN_KEY = '';

export const PTORX_CALLBACK_URL = PTORX_URL;

export const XYPAYMENTS_PRODUCTS = {
  1: 10,
  2: 11,
  3: 12
};

export const DIRECTORIES = {
  MAIL_CACHE: '',
  WEB: ''
};

export const SMTP_SERVER_OPTIONS: SMTPServerOptions = {
  banner: '',
  logger: true,
  cert: readFileSync(''),
  name: '',
  key: readFileSync('')
};