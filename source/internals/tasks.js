const path = require('path');
const fs = require('fs');

// Detect monorepo structure and find React Native app path
const findReactNativeAppPath = () => {
  // Check if we're in a monorepo with apps/react-native structure
  if (fs.existsSync('apps/react-native/package.json')) {
    return 'apps/react-native';
  }
  
  // Check for FRWRN app specifically
  if (fs.existsSync('apps/react-native') && fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (pkg.name === 'frw-monorepo' || (pkg.pnpm && pkg.pnpm.overrides)) {
        return 'apps/react-native';
      }
    } catch (e) {}
  }
  
  // Default to current directory for standard RN projects
  return '.';
};

// Detect package manager
const detectPackageManager = () => {
  if (fs.existsSync('pnpm-lock.yaml') || fs.existsSync('pnpm-workspace.yaml')) {
    return 'pnpm';
  }
  if (fs.existsSync('yarn.lock')) {
    return 'yarn';
  }
  return 'npm';
};

const rnAppPath = findReactNativeAppPath();
const packageManager = detectPackageManager();
const isMonorepo = rnAppPath !== '.';

const tasks = {
  wipeiOSBuildFolder: {
    name: 'wipe iOS build artifacts',
    command:
      `rm -rf ${rnAppPath}/ios/build && (killall Xcode || true) && xcrun -k && cd ${rnAppPath}/ios && xcodebuild -alltargets clean && cd ../.. && rm -rf "$(getconf DARWIN_USER_CACHE_DIR)/org.llvm.clang/ModuleCache" && rm -rf "$(getconf DARWIN_USER_CACHE_DIR)/org.llvm.clang.$(whoami)/ModuleCache" && rm -fr ~/Library/Developer/Xcode/DerivedData/ && rm -fr ~/Library/Caches/com.apple.dt.Xcode/`,
    args: []
  },
  wipeiOSPodsFolder: {
    name: 'wipe iOS Pods folder',
    command: 'rm',
    args: ['-rf', `${rnAppPath}/ios/Pods`]
  },
  wipeSystemiOSPodsCache: {
    name: 'wipe system iOS Pods cache',
    command: `cd ${rnAppPath}/ios && bundle exec pod`,
    args: ['cache', 'clean', '--all']
  },
  wipeUseriOSPodsCache: {
    name: 'wipe user iOS Pods cache',
    command: 'rm',
    args: ['-rf', '~/.cocoapods']
  },
  updatePods: {
    name: 'update iOS Pods',
    command: `cd ${rnAppPath}/ios && pod update`,
    args: []
  },
  wipeAndroidBuildFolder: {
    name: 'wipe android build folder',
    command: 'rm',
    args: ['-rf', `${rnAppPath}/android/build`]
  },
  cleanAndroidProject: {
    name: 'clean android project',
    command: `(cd ${rnAppPath}/android && ./gradlew clean)`,
    args: []
  },
  watchmanCacheClear: {
    name: 'watchman cache clear (if watchman is installed)',
    command: 'watchman watch-del-all || true',
    args: []
  },
  wipeTempCaches: {
    name: 'wipe temporary caches',
    command: 'rm',
    args: ['-rf', '$TMPDIR/react-*', '$TMPDIR/metro-*']
  },
  brewUpdate: {
    name: 'brew update',
    command: 'brew',
    args: ['update']
  },
  brewUpgrade: {
    name: 'brew upgrade',
    command: 'brew',
    args: ['upgrade']
  },
  wipeNodeModules: {
    name: 'wipe node_modules',
    command: isMonorepo ? 'rm -rf node_modules */node_modules packages/*/node_modules apps/*/node_modules' : 'rm -rf node_modules',
    args: []
  },
  packageManagerCacheClean: {
    name: `${packageManager} cache clean`,
    command: packageManager === 'pnpm' ? 'pnpm store prune' : 
             packageManager === 'yarn' ? 'test -f yarn.lock && yarn cache clean || true' : 
             'npm cache verify',
    args: []
  },
  packageManagerInstall: {
    name: `${packageManager} install`,
    command: packageManager === 'pnpm' ? 'pnpm install' : 
             packageManager === 'yarn' ? 'test -f yarn.lock && yarn install || true' : 
             'test -f package-lock.json && npm ci || true',
    args: []
  },
  // Legacy tasks for backward compatibility
  yarnCacheClean: {
    name: 'yarn cache clean (if yarn is installed)',
    command: 'test -f yarn.lock && yarn cache clean || true',
    args: []
  },
  yarnInstall: {
    name: 'yarn install (if yarn is installed)',
    command: 'test -f yarn.lock && yarn install || true',
    args: []
  },
  npmCacheVerify: {
    name: 'npm cache verify',
    command: 'npm',
    args: ['cache', 'verify']
  },
  npmInstall: {
    name: 'npm ci',
    command: 'test -f package-lock.json && npm ci || true',
    args: []
  }
};

/**
 * The order matters when running clean-project-auto,
 * aka "plugin.js"
 */
const autoTasks = [
  tasks.wipeiOSBuildFolder,
  tasks.wipeiOSPodsFolder,
  tasks.wipeSystemiOSPodsCache,
  tasks.wipeUseriOSPodsCache,
  tasks.wipeAndroidBuildFolder,
  tasks.watchmanCacheClear,
  tasks.wipeTempCaches,
  tasks.cleanAndroidProject,
  tasks.wipeNodeModules,
  tasks.packageManagerCacheClean,
  tasks.packageManagerInstall,
];

// Additional pnpm-specific tasks
if (packageManager === 'pnpm') {
  tasks.pnpmStoreClean = {
    name: 'clean pnpm store',
    command: 'pnpm store prune',
    args: []
  };
  
  tasks.wipePnpmCache = {
    name: 'wipe pnpm cache',
    command: 'rm -rf ~/.pnpm-state ~/.pnpm-store',
    args: []
  };
}

module.exports = {
  tasks,
  autoTasks,
  rnAppPath,
  packageManager,
  isMonorepo
};
