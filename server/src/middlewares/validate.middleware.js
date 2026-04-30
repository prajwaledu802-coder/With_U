/**
 * Lightweight schema validator — accepts a definition like:
 *   { body: { text: { type: 'string', required: true, min: 1, max: 2000 } } }
 * Returns 400 on validation failure.
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];
  for (const place of ['body', 'query', 'params']) {
    if (!schema[place]) continue;
    const data = req[place] || {};
    for (const [key, rule] of Object.entries(schema[place])) {
      const value = data[key];
      const isMissing = value === undefined || value === null || value === '';
      if (rule.required && isMissing) {
        errors.push(`${place}.${key} is required`);
        continue;
      }
      if (isMissing) continue;
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${place}.${key} must be string`);
      }
      if (rule.type === 'number' && Number.isNaN(Number(value))) {
        errors.push(`${place}.${key} must be number`);
      }
      if (rule.type === 'array' && !Array.isArray(value)) {
        errors.push(`${place}.${key} must be array`);
      }
      if (rule.min !== undefined) {
        const len = typeof value === 'string' || Array.isArray(value) ? value.length : Number(value);
        if (len < rule.min) errors.push(`${place}.${key} below min`);
      }
      if (rule.max !== undefined) {
        const len = typeof value === 'string' || Array.isArray(value) ? value.length : Number(value);
        if (len > rule.max) errors.push(`${place}.${key} above max`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${place}.${key} not in ${rule.enum.join(',')}`);
      }
    }
  }
  if (errors.length) {
    return res.status(400).json({ success: false, message: 'validation failed', errors });
  }
  next();
};

module.exports = { validate };
