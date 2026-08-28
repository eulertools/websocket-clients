import { createLogger, format, transports } from 'winston';

const formatLog = format.printf(({
                                   level,
                                   message,
                                   timestamp
                                 }) => `[${timestamp}][${level.toUpperCase()}] ${message}`);

const logW = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    formatLog
  ),
  transports: [new transports.Console()]
});

export default logW;
