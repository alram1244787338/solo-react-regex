import React from 'react';

function TestInput({ value, onChange }) {
  return (
    <div className="test-input-wrapper">
      <label className="input-label" htmlFor="test-input">
        测试文本
      </label>
      <textarea
        id="test-input"
        className="test-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="在此输入要测试的文本..."
        rows={10}
      />
    </div>
  );
}

export default TestInput;
