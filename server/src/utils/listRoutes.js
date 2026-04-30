// Dev helper — pretty-prints every mounted route. Used only for smoke tests.
const collect = (stack, prefix = '') => {
  const out = [];
  for (const m of stack || []) {
    if (m.route) {
      out.push(`${Object.keys(m.route.methods).join(',').toUpperCase().padEnd(7)} ${prefix}${m.route.path}`);
    } else if (m.name === 'router' && m.handle?.stack) {
      let p = prefix;
      const re = m.regexp?.toString() || '';
      const match = re.match(/\/\^\\\/(.+?)\\\//);
      if (match) p += '/' + match[1].replace(/\\\//g, '/');
      out.push(...collect(m.handle.stack, p));
    }
  }
  return out;
};
module.exports = { collect };
