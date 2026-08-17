const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const rootDistDir = path.join(__dirname, 'dist');

// 1. SERVE ALL REMOTE MFEs DYNAMICALLY
const mfeDistDir = path.join(rootDistDir, 'mfe');
if (fs.existsSync(mfeDistDir)) {
  const mfeFolders = fs.readdirSync(mfeDistDir);
  mfeFolders.forEach((mfe) => {
    const singleMfePath = path.join(mfeDistDir, mfe);
    app.use(`/mfe/${mfe}`, express.static(singleMfePath));
    console.log(`📡 MFE Served [${mfe}]: http://localhost:${PORT}/mfe/${mfe}/remoteEntry.js`);
  });
}

// 2. SERVE CONTAINER SHELL AT ROOT
const containerDist = path.join(rootDistDir, 'container');
if (fs.existsSync(containerDist)) {
  app.use(express.static(containerDist));

  app.get('*', (req, res) => {
    res.sendFile(path.join(containerDist, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(404).send('Root dist/ directory missing. Please run "npm run build:all" first.');
  });
}

app.listen(PORT, async () => {
  console.log(`\n🚀 Frontend Static Server running at http://localhost:${PORT}`);

  // Automatically open browser window
  try {
    const open = (await import('open')).default;
    await open(`http://localhost:${PORT}`);
    console.log(`🌐 Opened http://localhost:${PORT} in your default browser!`);
  } catch (err) {
    console.log(`💡 Access your application at: http://localhost:${PORT}`);
  }
});