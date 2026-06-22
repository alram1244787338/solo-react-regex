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

function formatRegexInput(pattern, flags) {
  return `/${pattern}/${flags || ''}`;
}

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

function getGroupCount(regex) {
  if (!regex) return 0;
  try {
    const testRe = new RegExp(regex.source + '|');
    const match = testRe.exec('');
    return match ? match.length - 1 : 0;
  } catch (e) {
    return 0;
  }
}

function matchAll(regex, text) {
  if (!regex || !text) return [];

  const results = [];
  const hasGlobal = regex.flags.includes('g');
  const re = new RegExp(regex.source, regex.flags);

  if (hasGlobal) {
    let match;
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
    const match = re.exec(text);
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
  formatRegexInput,
  parseRegex,
  getGroupCount,
  matchAll,
  highlightMatches,
};
