import dotenv from 'dotenv';

dotenv.config();

export const appConfig = () => ({
  aws_config: {
    region: process.env.AWS_REGION || 'us-east-1',
  },
  config: {
    dsn_url: process.env.DSN_URL || '',
    env: process.env.NODE_ENV || 'development',
    mode: process.env.MODE || '',
  },
});
