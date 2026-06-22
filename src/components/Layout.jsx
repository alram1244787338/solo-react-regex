import React, { useState, useMemo } from 'react';
import RegexInput from './RegexInput.jsx';
import TestInput from './TestInput.jsx';
import MatchResult from './MatchResult.jsx';
import PresetList from './PresetList.jsx';
import { parseRegex, matchAll } from '../utils/regex.js';

function Layout() {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');

  const { regex, error } = useMemo(() => parseRegex(pattern), [pattern]);
  const matches = useMemo(() => matchAll(regex, testText), [regex, testText]);

  const handlePresetSelect = (presetPattern) => {
    setPattern(presetPattern);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>正则表达式测试器</h1>
      </header>
      <main className="app-main">
        <div className="main-grid">
          <section className="left-panel">
            <div className="panel-section">
              <RegexInput value={pattern} onChange={setPattern} error={error} />
            </div>
            <div className="panel-section">
              <PresetList onSelect={handlePresetSelect} />
            </div>
            <div className="panel-section">
              <TestInput value={testText} onChange={setTestText} />
            </div>
          </section>
          <section className="right-panel">
            <MatchResult text={testText} matches={matches} />
          </section>
        </div>
      </main>
    </div>
  );
}

export default Layout;
