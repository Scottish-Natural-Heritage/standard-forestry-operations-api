import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {service: 'standard-forestry-operations-api'},
  transports: [new winston.transports.Console({colorize: true})]
});

logger.stream = {
  write: (message) => {
    logger.info(message);
  }
};

const unErrorJson = (json) => {
  if (json instanceof Error) {
    const unError = {};
    for (const key of Object.getOwnPropertyNames(json)) {
      unError[key] = json[key]
    }
    return unError;
  }

  return json;
}

export {logger as default, unErrorJson};
