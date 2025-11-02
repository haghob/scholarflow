// backend/src/utils/logger.ts
import winston from 'winston';

const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  let metaString = '';
  
  if (Object.keys(meta).length > 0) {
    try {
      const cleanMeta = Object.entries(meta).reduce((acc, [key, value]) => {
        if (key === 'request' || key === 'response' || key === 'agent' || key === 'socket') {
          return acc;
        }
        
        if (value instanceof Error) {
          acc[key] = {
            message: value.message,
            stack: value.stack,
            name: value.name
          };
        } else if (typeof value === 'object' && value !== null) {
          try {
            JSON.stringify(value);
            acc[key] = value;
          } catch {
            acc[key] = '[Complex Object]';
          }
        } else {
          acc[key] = value;
        }
        
        return acc;
      }, {} as any);
      
      if (Object.keys(cleanMeta).length > 0) {
        metaString = ' ' + JSON.stringify(cleanMeta);
      }
    } catch (error) {
      metaString = ' [Unserializable metadata]';
    }
  }

  return `${timestamp} [${level}]: ${message}${metaString}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ 
    filename: 'logs/error.log', 
    level: 'error' 
  }));
  logger.add(new winston.transports.File({ 
    filename: 'logs/combined.log' 
  }));
}

export default logger;