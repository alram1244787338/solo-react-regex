import React from 'react';
import { highlightMatches } from '../utils/regex.js';

function MatchResult({ text, matches, groups }) {
  const segments = highlightMatches(text, matches);
  const matchCount = matches.length;
  const hasGroups = matches.length > 0 && matches[0].groups && matches[0].groups.length > 0;

  return (
    <div className="match-result-wrapper">
      <div className="match-header">
        <h3 className="result-title">匹配结果</h3>
        <span className="match-count">
          共匹配 <strong>{matchCount}</strong> 处
        </span>
      </div>

      <div className="highlight-section">
        <div className="section-label">高亮预览：</div>
        <div className="highlight-text">
          {text
            ? segments.map((seg, i) =>
                seg.highlighted ? (
                  <mark key={i} className="match-mark">
                    {seg.text}
                  </mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )
            : <span className="empty-hint">（暂无文本）</span>}
        </div>
      </div>

      {hasGroups && (
        <div className="groups-section">
          <div className="section-label">分组捕获：</div>
          <div className="groups-list">
            {matches.map((m, matchIdx) => (
              <div key={matchIdx} className="match-item">
                <div className="match-item-title">匹配 #{matchIdx + 1}：「{m.match}」</div>
                <div className="match-groups">
                  {m.groups.map((g, groupIdx) => (
                    <div key={groupIdx} className="group-item">
                      <span className="group-label">Group {groupIdx + 1}：</span>
                      <code className="group-value">{g !== undefined ? g : '(未捕获)'}</code>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchResult;
