import { describe, it, expect } from './runner.js';
import {
  PRESETS,
  parseRegex,
  matchAll,
  highlightMatches,
  getGroupCount,
  formatRegexInput,
} from '../src/utils/regex.js';

describe('parseRegex', () => {
  it('正常 pattern：纯字符串自动补 g flag', () => {
    const { regex, error } = parseRegex('\\d+');
    expect(error).toBeNull();
    expect(regex).toBeDefined();
    expect(regex.source).toBe('\\d+');
    expect(regex.flags).toBe('g');
  });

  it('/pattern/g 格式：解析正确 flag', () => {
    const { regex, error } = parseRegex('/\\d+/gi');
    expect(error).toBeNull();
    expect(regex).toBeDefined();
    expect(regex.source).toBe('\\d+');
    expect(regex.flags).toBe('gi');
  });

  it('/pattern/ 格式：无 flag 正确解析', () => {
    const { regex, error } = parseRegex('/hello/');
    expect(error).toBeNull();
    expect(regex).toBeDefined();
    expect(regex.source).toBe('hello');
    expect(regex.flags).toBe('');
  });

  it('非法正则：返回 error，regex 为 null', () => {
    const { regex, error } = parseRegex('/(/');
    expect(regex).toBeNull();
    expect(error).toBeDefined();
    expect(error.length > 0).toBeTruthy();
  });

  it('非法纯字符串 pattern：返回 error', () => {
    const { regex, error } = parseRegex('(unclosed');
    expect(regex).toBeNull();
    expect(error).toBeDefined();
  });

  it('空字符串：regex 和 error 都为 null', () => {
    const { regex, error } = parseRegex('');
    expect(regex).toBeNull();
    expect(error).toBeNull();
  });

  it('仅空白字符：regex 和 error 都为 null', () => {
    const { regex, error } = parseRegex('   ');
    expect(regex).toBeNull();
    expect(error).toBeNull();
  });

  it('URL 预设含 //：能正确解析 pattern 和 flags', () => {
    const pattern = formatRegexInput(
      'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+',
      'g'
    );
    const { regex, error } = parseRegex(pattern);
    expect(error).toBeNull();
    expect(regex).toBeDefined();
    expect(regex.flags).toBe('g');
    expect(regex.source).toContain('https');
  });

  it('多 flag 组合 gimsuy：全部解析正确', () => {
    const { regex, error } = parseRegex('/./gimsuy');
    expect(error).toBeNull();
    expect(regex.flags).toBe('gimsuy');
  });
});

describe('matchAll', () => {
  it('带 g flag：返回多个匹配', () => {
    const { regex } = parseRegex('/\\d{4}/g');
    const matches = matchAll(regex, '2024年,2025年,2026年');
    expect(matches).toHaveLength(3);
    expect(matches[0].match).toBe('2024');
    expect(matches[1].match).toBe('2025');
    expect(matches[2].match).toBe('2026');
  });

  it('带 g flag：匹配有正确 index', () => {
    const { regex } = parseRegex('/cat/g');
    const matches = matchAll(regex, 'the cat and the cat');
    expect(matches).toHaveLength(2);
    expect(matches[0].index).toBe(4);
    expect(matches[1].index).toBe(16);
  });

  it('不带 g flag：只返回第一个匹配', () => {
    const { regex } = parseRegex('/\\d{4}/');
    const matches = matchAll(regex, '2024年,2025年,2026年');
    expect(matches).toHaveLength(1);
    expect(matches[0].match).toBe('2024');
    expect(matches[0].index).toBe(0);
  });

  it('不带 g flag：即使有多个也只返回一个', () => {
    const { regex } = parseRegex('/a/');
    const matches = matchAll(regex, 'aaa');
    expect(matches).toHaveLength(1);
    expect(matches[0].match).toBe('a');
    expect(matches[0].index).toBe(0);
  });

  it('零长度匹配：不卡死，推进 lastIndex', () => {
    const { regex } = parseRegex('/\\b/g');
    const text = 'hello world';
    const matches = matchAll(regex, text);
    expect(matches.length > 0).toBeTruthy();
    expect(matches.length <= text.length + 2).toBeTruthy();
  });

  it('零长度匹配 ^：每行边界正常', () => {
    const { regex } = parseRegex('/^/gm');
    const matches = matchAll(regex, 'a\nb\nc');
    expect(matches).toHaveLength(3);
    expect(matches[0].index).toBe(0);
    expect(matches[1].index).toBe(2);
    expect(matches[2].index).toBe(4);
  });

  it('空文本：返回空数组', () => {
    const { regex } = parseRegex('/\\d+/g');
    const matches = matchAll(regex, '');
    expect(matches).toStrictEqual([]);
  });

  it('无匹配：返回空数组', () => {
    const { regex } = parseRegex('/xyz/g');
    const matches = matchAll(regex, 'hello world');
    expect(matches).toStrictEqual([]);
  });

  it('regex 为 null：返回空数组', () => {
    const matches = matchAll(null, 'hello');
    expect(matches).toStrictEqual([]);
  });

  it('捕获组：groups 正确', () => {
    const { regex } = parseRegex('/(\\d{4})-(\\d{2})-(\\d{2})/g');
    const matches = matchAll(regex, '2024-01-15, 2025-12-31');
    expect(matches).toHaveLength(2);
    expect(matches[0].groups).toStrictEqual(['2024', '01', '15']);
    expect(matches[1].groups).toStrictEqual(['2025', '12', '31']);
  });

  it('g flag 切换：无 g 只返回一个，再切 g 返回多个', () => {
    const { regex: g } = parseRegex('/a/g');
    const { regex: noG } = parseRegex('/a/');
    const t = 'aaa';
    expect(matchAll(g, t)).toHaveLength(3);
    expect(matchAll(noG, t)).toHaveLength(1);
    expect(matchAll(g, t)).toHaveLength(3);
  });
});

describe('highlightMatches', () => {
  it('正常匹配：生成 mark 片段，highlighted=true', () => {
    const { regex } = parseRegex('/fox/g');
    const matches = matchAll(regex, 'the quick fox jumps over the lazy fox');
    const segments = highlightMatches('the quick fox jumps over the lazy fox', matches);
    expect(segments.length >= 3).toBeTruthy();
    expect(segments[0].highlighted).toBe(false);
    expect(segments[1].highlighted).toBe(true);
    expect(segments[1].text).toBe('fox');
  });

  it('正常匹配：全文按顺序正确拼回原文本', () => {
    const text = 'the quick fox jumps over the lazy fox';
    const { regex } = parseRegex('/fox/g');
    const matches = matchAll(regex, text);
    const segments = highlightMatches(text, matches);
    const joined = segments.map(s => s.text).join('');
    expect(joined).toBe(text);
  });

  it('无匹配：仅一个片段，highlighted=false', () => {
    const segments = highlightMatches('hello world', []);
    expect(segments).toHaveLength(1);
    expect(segments[0].highlighted).toBe(false);
    expect(segments[0].text).toBe('hello world');
  });

  it('空文本：返回空文本片段', () => {
    const segments = highlightMatches('', [{ match: 'a', index: 0, groups: [] }]);
    expect(segments).toHaveLength(1);
    expect(segments[0].text).toBe('');
  });

  it('matches 为 null：无 mark 片段', () => {
    const segments = highlightMatches('hello', null);
    expect(segments).toHaveLength(1);
    expect(segments[0].highlighted).toBe(false);
  });

  it('matches 为 undefined：无 mark 片段', () => {
    const segments = highlightMatches('hello');
    expect(segments).toHaveLength(1);
    expect(segments[0].highlighted).toBe(false);
  });

  it('含换行符：片段中保留 \\n', () => {
    const text = 'foo\nbar';
    const { regex } = parseRegex('/foo|bar/g');
    const matches = matchAll(regex, text);
    const segments = highlightMatches(text, matches);
    const joined = segments.map(s => s.text).join('');
    expect(joined).toBe(text);
    expect(segments.some(s => s.text.includes('\n'))).toBeTruthy();
  });

  it('重叠匹配（按 index 排序）：处理有序', () => {
    const text = 'abc';
    const matches = [
      { match: 'bc', index: 1, groups: [] },
      { match: 'ab', index: 0, groups: [] },
    ];
    const segments = highlightMatches(text, matches);
    expect(segments[0].highlighted).toBe(true);
    expect(segments[0].text).toBe('ab');
  });

  it('全匹配：仅一个 highlighted 片段', () => {
    const text = 'hello';
    const { regex } = parseRegex('/hello/g');
    const matches = matchAll(regex, text);
    const segments = highlightMatches(text, matches);
    expect(segments).toHaveLength(1);
    expect(segments[0].highlighted).toBe(true);
    expect(segments[0].text).toBe('hello');
  });
});

describe('PRESETS', () => {
  it('预设数量：至少 6 个', () => {
    expect(PRESETS.length >= 6).toBeTruthy();
  });

  it('每个预设都有 name、pattern、flags 字段', () => {
    for (const preset of PRESETS) {
      expect(typeof preset.name).toBe('string');
      expect(preset.name.length > 0).toBeTruthy();
      expect(typeof preset.pattern).toBe('string');
      expect(preset.pattern.length > 0).toBeTruthy();
      expect(typeof preset.flags).toBe('string');
    }
  });

  it('每个预设都能通过 new RegExp 校验', () => {
    for (const preset of PRESETS) {
      let re = null;
      let err = null;
      try {
        re = new RegExp(preset.pattern, preset.flags);
      } catch (e) {
        err = e;
      }
      expect(err).toBeNull();
      expect(re).toBeDefined();
      expect(re.source.length > 0).toBeTruthy();
    }
  });

  it('邮箱预设：能匹配标准邮箱', () => {
    const preset = PRESETS.find(p => p.name === '邮箱');
    const re = new RegExp(preset.pattern, preset.flags);
    const matches = 'a@test.com xyz foo.bar@domain.org'.match(re);
    expect(matches).toHaveLength(2);
    expect(matches).toContain('a@test.com');
    expect(matches).toContain('foo.bar@domain.org');
  });

  it('手机号预设：能匹配 13、15、18 开头手机号', () => {
    const preset = PRESETS.find(p => p.name === '手机号');
    const re = new RegExp(preset.pattern, preset.flags);
    const matches = '13812345678 15987654321 x 18000000000'.match(re);
    expect(matches).toHaveLength(3);
  });

  it('URL 预设：能匹配含 // 的 URL', () => {
    const preset = PRESETS.find(p => p.name === 'URL');
    const re = new RegExp(preset.pattern, preset.flags);
    const matches = '官网: https://www.example.com 文档: http://docs.test.org/guide'.match(re);
    expect(matches).toHaveLength(2);
    expect(matches.some(u => u.includes('https://'))).toBeTruthy();
  });

  it('IP 地址预设：能匹配合法 IPv4', () => {
    const preset = PRESETS.find(p => p.name === 'IP 地址');
    const re = new RegExp(preset.pattern, preset.flags);
    const matches = '服务器: 192.168.1.1 和 10.0.0.255'.match(re);
    expect(matches).toHaveLength(2);
  });

  it('日期预设：能匹配合法日期', () => {
    const preset = PRESETS.find(p => p.name.startsWith('日期'));
    const re = new RegExp(preset.pattern, preset.flags);
    const matches = '2024-01-15 2025-12-31 非法: 2024-13-01'.match(re);
    expect(matches).toHaveLength(2);
    expect(matches).toContain('2024-01-15');
    expect(matches).toContain('2025-12-31');
  });
});

describe('getGroupCount（辅助函数）', () => {
  it('无捕获组：返回 0', () => {
    const { regex } = parseRegex('/\\d+/');
    expect(getGroupCount(regex)).toBe(0);
  });

  it('三个捕获组：返回 3', () => {
    const { regex } = parseRegex('/(\\d{4})-(\\d{2})-(\\d{2})/');
    expect(getGroupCount(regex)).toBe(3);
  });

  it('含非捕获组：只计捕获组', () => {
    const { regex } = parseRegex('/(?:\\d{4})-(\\d{2})-(\\d{2})/');
    expect(getGroupCount(regex)).toBe(2);
  });

  it('regex 为 null：返回 0', () => {
    expect(getGroupCount(null)).toBe(0);
  });
});

describe('formatRegexInput（辅助函数）', () => {
  it('拼 pattern 和 flags 为标准格式', () => {
    expect(formatRegexInput('\\d+', 'g')).toBe('/\\d+/g');
  });

  it('无 flags 时只有 pattern', () => {
    expect(formatRegexInput('hello', '')).toBe('/hello/');
  });

  it('URL 含 //：拼出来仍以 / 开头结尾', () => {
    const result = formatRegexInput('https?://x', 'g');
    expect(result.startsWith('/')).toBeTruthy();
    expect(result.endsWith('/g')).toBeTruthy();
  });
});
