const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const ts = () => new Date().toISOString();

const logger = {
  info: (...args) => console.log(`${colors.green}[INFO]${colors.reset} ${ts()}`, ...args),
  warn: (...args) => console.warn(`${colors.yellow}[WARN]${colors.reset} ${ts()}`, ...args),
  error: (...args) => console.error(`${colors.red}[ERR ]${colors.reset} ${ts()}`, ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colors.gray}[DBG ]${colors.reset} ${ts()}`, ...args);
    }
  },
};

module.exports = logger;
