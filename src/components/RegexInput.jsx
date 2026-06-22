import React from 'react';

function RegexInput({ value, onChange, error }) {
  return (
    <div className="regex-input-wrapper">
      <label className="input-label" htmlFor="regex-input">
        正则表达式
        <span className="input-hint">格式: /pattern/flags 或直接写 pattern</span>
      </label>
      <input
        id="regex-input"
        type="text"
        className={`regex-input ${error ? 'regex-input-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/pattern/g 或 pattern"
        spellCheck={false}
        autoComplete="off"
      />
      {error && <div className="regex-error">正则表达式语法错误：{error}</div>}
    </div>
  );
}

export default RegexInput;
