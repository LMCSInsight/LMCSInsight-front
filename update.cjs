const fs = require('fs');

let data = fs.readFileSync('src/features/supervisions/pages/CreateSupervisionPage.tsx', 'utf8');

data = data.replace(/color: '#1a1a2e'/g, "color: '#21334E'");
data = data.replace(/borderColor: '#f0f0f0'/g, "borderColor: '#EBF1F9'");
data = data.replace(/color: '#555'/g, "color: '#21334E'");
data = data.replace(/color: '#888'/g, "color: '#6b7280'");

// primary button
data = data.replace(/backgroundColor: '#1a1a2e',\s*borderColor: '#1a1a2e'/g, "backgroundColor: '#11499A',\n                borderColor: '#11499A'");

// co-encadrant button
data = data.replace(/borderColor: '#1677ff',\s*color: '#1677ff'/g, "borderColor: '#11499A',\n                  color: '#11499A'");

// Fix imports to add ConfigProvider
if (!data.includes('ConfigProvider')) {
  data = data.replace("import {", "import {\n  ConfigProvider,");
}

// Replace wrapping div
const oldWrapper = `return (
    <div
      style={{
        maxWidth: 780,
        margin: '0 auto',
        padding: '28px 32px 48px',
        background: '#fff',
        minHeight: '100vh',
      }}
    >`;

const newWrapper = `return (
    <ConfigProvider theme={{ token: { colorPrimary: '#11499A', fontFamily: "'Outfit', sans-serif" } }}>
      <div
        style={{
          background: '#F5F5F5',
          fontFamily: "'Outfit', sans-serif",
          minHeight: '100vh',
          paddingBottom: '24px',
        }}
      >
        <style>{\`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');\`}</style>
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            padding: '28px 32px 48px',
            background: '#FFFFFF',
            minHeight: '100vh',
          }}
        >`;

data = data.replace(oldWrapper, newWrapper);

// Close tags at the end
const oldBottom = `</Form>
    </div>
  );
}`;

const newBottom = `</Form>
        </div>
      </div>
    </ConfigProvider>
  );
}`;

data = data.replace(oldBottom, newBottom);

fs.writeFileSync('src/features/supervisions/pages/CreateSupervisionPage.tsx', data);
