import React from 'react';

function Layout() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>正则表达式测试器</h1>
      </header>
      <main className="app-main">
        <div className="placeholder-section">
          <p>项目框架已搭建，占位页面</p>
          <p className="placeholder-hint">后续功能：正则输入、测试文本、实时高亮、分组捕获、预设库</p>
        </div>
      </main>
    </div>
  );
}

export default Layout;
