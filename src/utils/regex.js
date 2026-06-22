const PRESETS = [
  {
    name: '邮箱',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
  },
  {
    name: '手机号',
    pattern: '1[3-9]\\d{9}',
    flags: 'g',
  },
  {
    name: 'URL',
    pattern: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+',
    flags: 'g',
  },
  {
    name: '身份证号',
    pattern: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]',
    flags: 'g',
  },
  {
    name: 'IP 地址',
    pattern: '((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)',
    flags: 'g',
  },
  {
    name: '日期 (YYYY-MM-DD)',
    pattern: '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])',
    flags: 'g',
  },
];

function parseRegex(pattern) {
  if (!pattern || !pattern.trim()) {
    return { regex: null, error: null };
  }

  const match = pattern.match(/^\/(.+)\/([gimsuy]*)$/);

  let regexBody;
  let flags;

  if (match) {
    regexBody = match[1];
    flags = match[2];
  } else {
    regexBody = pattern;
    flags = 'g';
  }

  try {
    const regex = new RegExp(regexBody, flags);
    return { regex, error: null };
  } catch (e) {
    return { regex: null, error: e.message };
  }
}

function getGroups(regex) {
  if (!regex) return [];

  const groups = [];
  const source = regex.source;
  let depth = 0;
  let inClass = false;
  let escaped = false;
  let groupIndex = 0;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      continue;
    }

    if (ch === '[') {
      inClass = true;
      continue;
    }

    if (ch === ']') {
      inClass = false;
      continue;
    }

    if (inClass) continue;

    if (ch === '(') {
      const next = source[i + 1];
      if (next === '?') {
        if (source[i + 2] === ':' || source[i + 2] === '=' || source[i + 2] === '!' || source[i + 2] === '<') {
          continue;
        }
      }
      groupIndex++;
      groups.push(groupIndex);
    }
  }

  return groups;
}

function matchAll(regex, text) {
  if (!regex || !text) return [];

  const results = [];
  const hasGlobal = regex.flags.includes('g');

  if (hasGlobal) {
    let match;
    const re = new RegExp(regex.source, regex.flags);
    while ((match = re.exec(text)) !== null) {
      results.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
      });
      if (match[0].length === 0) {
        re.lastIndex++;
      }
    }
  } else {
    const match = regex.exec(text);
    if (match) {
      results.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
      });
    }
  }

  return results;
}

function highlightMatches(text, matches) {
  if (!text || !matches || matches.length === 0) {
    return [{ text, highlighted: false }];
  }

  const segments = [];
  let lastIndex = 0;

  const sorted = [...matches].sort((a, b) => a.index - b.index);

  for (const m of sorted) {
    if (m.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, m.index),
        highlighted: false,
      });
    }
    segments.push({
      text: text.slice(m.index, m.index + m.match.length),
      highlighted: true,
    });
    lastIndex = m.index + m.match.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      highlighted: false,
    });
  }

  return segments;
}

export {
  PRESETS,
  parseRegex,
  getGroups,
  matchAll,
  highlightMatches,
};
