import React from 'react';
import { PRESETS } from '../utils/regex.js';

function PresetList({ onSelect }) {
  return (
    <div className="preset-wrapper">
      <div className="section-label">常用正则预设：</div>
      <div className="preset-list">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className="preset-btn"
            onClick={() => onSelect(preset.pattern, preset.flags)}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PresetList;
