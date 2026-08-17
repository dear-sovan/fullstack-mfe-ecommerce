const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = __dirname;
const globalDistDir = path.join(rootDir, 'dist');
const hashesFile = path.join(globalDistDir, '.project-hashes.json');

const WATCH_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html'];
const IGNORED_FOLDERS = ['node_modules', '.git', 'dist', 'build', '.cache', 'services'];

// Recursive helper to compute MD5 hash for a specific project directory
function computeDirHash(dir, currentHash = crypto.createHash('md5')) {
  if (!fs.existsSync(dir)) return currentHash;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_FOLDERS.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      computeDirHash(fullPath, currentHash);
    } else if (WATCH_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      const fileBuffer = fs.readFileSync(fullPath);
      currentHash.update(fullPath);
      currentHash.update(fileBuffer);
    }
  }

  return currentHash;
}

// Copy helper function
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Discover all subprojects in workspace
function discoverProjects(dir, discovered = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory() && !IGNORED_FOLDERS.includes(item.name)) {
      const fullPath = path.join(dir, item.name);
      const pkgPath = path.join(fullPath, 'package.json');

      if (fs.existsSync(pkgPath) && fullPath !== rootDir) {
        discovered.push(fullPath);
      }

      discoverProjects(fullPath, discovered);
    }
  }

  return discovered;
}

// Ensure central dist folder exists
fs.mkdirSync(globalDistDir, { recursive: true });

// Load previous project hashes
let previousHashes = {};
if (fs.existsSync(hashesFile)) {
  try {
    previousHashes = JSON.parse(fs.readFileSync(hashesFile, 'utf8'));
  } catch (err) {
    previousHashes = {};
  }
}

const currentHashes = {};
const projects = discoverProjects(rootDir);
let builtCount = 0;

console.log('🔍 Checking for per-package source changes...\n');

for (const projectDir of projects) {
  const relativePath = path.relative(rootDir, projectDir);
  const pkgJsonPath = path.join(projectDir, 'package.json');
  const pkgJson = require(pkgJsonPath);

  // Skip packages without a build script
  if (!pkgJson.scripts || !pkgJson.scripts.build) continue;

  const pkgName = pkgJson.name || relativePath;
  const projectHash = computeDirHash(projectDir).digest('hex');
  currentHashes[pkgName] = projectHash;

  // Determine target output directory inside central root dist/
  const folderName = path.basename(projectDir);
  let targetDist;
  if (folderName === 'container') {
    targetDist = path.join(globalDistDir, 'container');
  } else if (relativePath.startsWith('frontends')) {
    targetDist = path.join(globalDistDir, 'mfe', folderName);
  } else if (relativePath.startsWith('services')) {
    targetDist = path.join(globalDistDir, 'services', folderName);
  } else {
    targetDist = path.join(globalDistDir, folderName);
  }

  const targetDistExists = fs.existsSync(targetDist);
  const isUnchanged = previousHashes[pkgName] === projectHash;

  // Skip compilation if package source is unchanged AND target output folder exists
  if (isUnchanged && targetDistExists) {
    console.log(`⚡ Skipping [ ${pkgName} ] (No changes detected)`);
    continue;
  }

  // Build package
  console.log(`🚀 Building package: [ ${pkgName} ]...`);
  try {
    execSync('npm run build', {
      cwd: projectDir,
      stdio: 'inherit',
    });

    const localDist = path.join(projectDir, 'dist');
    const localBuild = path.join(projectDir, 'build');
    const sourceOutputDir = fs.existsSync(localDist)
      ? localDist
      : fs.existsSync(localBuild)
      ? localBuild
      : null;

    if (sourceOutputDir) {
      // Re-populate central output
      if (fs.existsSync(targetDist)) {
        fs.rmSync(targetDist, { recursive: true, force: true });
      }
      copyDirSync(sourceOutputDir, targetDist);

      // Clean up local frontend build folders, keep backend dist local if needed
      if (relativePath.startsWith('frontends')) {
        fs.rmSync(sourceOutputDir, { recursive: true, force: true });
      }
    }
    builtCount++;
  } catch (error) {
    console.error(`❌ Build failed for package: ${pkgName}`);
    process.exit(1);
  }
}

// Store updated hashes back to central dist
fs.writeFileSync(hashesFile, JSON.stringify(currentHashes, null, 2), 'utf8');

if (builtCount === 0) {
  console.log('\n✨ All projects are up-to-date! No builds were required.\n');
} else {
  console.log(`\n🎉 Successfully built ${builtCount} updated package(s)!\n`);
}