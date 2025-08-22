# React Native Clean Project

[![npm version](https://badge.fury.io/js/react-native-clean-project.svg)](https://www.npmjs.com/package/react-native-clean-project) ![https://img.shields.io/github/license/pmadruga/react-native-clean-project.svg](https://img.shields.io/github/license/pmadruga/react-native-clean-project.svg)
[![GitHub issues](https://img.shields.io/github/issues/pmadruga/react-native-clean-project.svg)](https://github.com/pmadruga/react-native-clean-project/issues)
[![Build Status](https://travis-ci.org/pmadruga/react-native-clean-project.svg?branch=master)](https://travis-ci.org/pmadruga/react-native-clean-project)

Cleans your React Native project by purging caches and modules, and reinstalling them again. 

**✨ Now with Monorepo & pnpm Support!** Automatically detects and handles monorepo structures with proper workspace management.

## Installing

```bash
# npm
npm install --save-dev react-native-clean-project

# yarn
yarn add -D react-native-clean-project

# pnpm (monorepo recommended)
pnpm add -D react-native-clean-project
```

## Running

### React-Native CLI plugin

This module is automatically detected as a plugin by the standard `react-native` command, adding new sub-commands:

- `react-native clean-project-auto` - fully automated project state clean: like a freshly-cloned, never-started repo
- `react-native clean-project` - interactive project state clean: choose types of react-native state to clean

### Direct execution

For complete control (including using command-line arguments to non-interactively fine-tune what state is cleaned):

`npx react-native-clean-project`

Or add it as a script to your `package.json`

```json
"scripts": {
  "clean": "react-native-clean-project"
}
```

## Content

This is a combination of the commands suggested in the React Native documentation plus others.

| State Type                | Command                                    | In `clean-project-auto`? | Optional? | Default? | Option Flag                  |
| ------------------------- | ------------------------------------------ | ------------------------ | --------- | -------- | ---------------------------- |
| React-native cache        | `rm -rf $TMPDIR/react-*`                   | Yes                      | No        | true     |                              |
| Metro bundler cache       | `rm -rf $TMPDIR/metro-*`                   | Yes                      | No        | true     |                              |
| Watchman cache            | `watchman watch-del-all`                   | Yes                      | No        | true     |                              |
| Node modules (monorepo)   | `rm -rf **/node_modules` (workspace-aware) | Yes                      | Yes       | true     | --keep-node-modules          |
| Package manager cache     | `pnpm store prune` / `yarn cache clean`    | Yes                      | Yes       | true     | --keep-node-modules          |
| Package manager install   | `pnpm install` / `yarn install`            | Yes                      | Yes       | true     | --keep-node-modules          |
| iOS build folder          | `rm -rf {path}/ios/build`                  | Yes                      | Yes       | false    | --remove-iOS-build           |
| iOS pods folder           | `rm -rf {path}/ios/Pods`                   | Yes                      | Yes       | false    | --remove-iOS-pods            |
| system iOS pods cache     | `pod cache clean --all`                    | Yes                      | Yes       | true     | --keep-system-iOS-pods-cache |
| user iOS pods cache       | `rm -rf ~/.cocoapods`                      | Yes                      | Yes       | true     | --keep-user-iOS-pods-cache   |
| Android build folder      | `rm -rf {path}/android/build`              | Yes                      | Yes       | false    | --remove-android-build       |
| Android clean project     | `(cd {path}/android && ./gradlew clean)`   | Yes                      | Yes       | false    | --clean-android-project      |
| Brew package              | `brew update && brew upgrade`              | No                       | Yes       | true     | --keep-brew                  |
| Pod packages              | `pod update`                               | No                       | Yes       | true     | --keep-pods                  |

**Note**: `{path}` automatically resolves to `apps/react-native/` in monorepos or `.` in standard projects.

Example: `npx react-native-clean-project --remove-iOS-build`

## Monorepo Support

This tool automatically detects monorepo structures and adjusts cleaning paths accordingly:

### Supported Structures

- **pnpm workspaces**: Detects `pnpm-lock.yaml` and workspace configurations
- **Standard monorepos**: Supports `apps/react-native/` structure
- **Multi-package**: Cleans all workspace `node_modules` safely

### Detection Logic

The tool automatically:
1. Detects package manager (pnpm, yarn, npm)
2. Finds React Native app location (`apps/react-native/` or current directory)
3. Adjusts all paths for iOS (`ios/`), Android (`android/`), and build folders
4. Uses appropriate package manager commands for cache cleaning

### Example Monorepo Structure

```
my-monorepo/
├── package.json              # Root workspace
├── pnpm-workspace.yaml       # pnpm config
├── apps/
│   ├── react-native/         # RN app automatically detected
│   │   ├── ios/             # Cleaned as apps/react-native/ios/
│   │   └── android/         # Cleaned as apps/react-native/android/
│   └── web/
└── packages/
    ├── shared-ui/
    └── utils/
```

## Other Tips

You can also reset the Metro bundler cache when starting with `react-native start --reset-cache`

## Support 

This library does not support windows. PR's are welcome.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

- **Pedro Madruga** - [twitter](https://twitter.com/pmadruga_)

See also the list of [contributors](https://github.com/pmadruga/react-native-clean-project/graphs/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
