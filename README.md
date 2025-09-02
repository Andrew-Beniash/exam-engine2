# Exam Engine

A React Native 0.74.x TypeScript monorepo for exam preparation apps with TDD approach.

## Features

- 🚀 React Native 0.74.x with TypeScript
- 📱 Bottom tab navigation (Dashboard & Practice screens)
- 🧪 Complete testing setup with Jest + React Testing Library
- ✅ Pre-commit hooks with Husky and lint-staged
- 🔧 ESLint + Prettier configuration
- 📦 Yarn package management
- 🏗️ CI-ready scripts

## Quick Start

### Prerequisites

- Node.js >= 18
- Yarn
- React Native development environment (iOS/Android)

### Installation

```bash
# Clone the repository
cd exam-engine

# Install dependencies
yarn install

# For iOS (macOS only)
cd ios && pod install && cd ..
```

### Development Commands

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run linter
yarn lint

# Fix linting issues
yarn lint:fix

# Type check
yarn typecheck

# Start Metro bundler
yarn start

# Run on iOS
yarn ios

# Run on Android
yarn android
```

## Project Structure

```
exam-engine/
├── __tests__/               # Test files
│   └── AppNavigator.test.tsx
├── src/                     # Source code
│   ├── screens/            # Screen components
│   │   ├── Dashboard.tsx   
│   │   └── Practice.tsx    
│   └── App.tsx             # Main app component
├── android/                # Android-specific files
├── ios/                    # iOS-specific files
├── .eslintrc.js            # ESLint configuration
├── .prettierrc.js          # Prettier configuration
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Testing

The project uses Jest and React Testing Library for testing. The test setup includes:

- **Unit/Integration tests**: Test individual components and their interactions
- **Mocked dependencies**: React Navigation, React Native screens, and Safe Area Context
- **TDD approach**: Tests written first, implementation follows

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode (development)
yarn test:watch

# Run tests with coverage
yarn test --coverage
```

### Test Example

The project includes an acceptance test that validates the main navigation:

```typescript
// __tests__/AppNavigator.test.tsx
it('renders App with Dashboard and Practice tabs', () => {
  render(<App />);
  
  expect(screen.getByText('Dashboard')).toBeTruthy();
  expect(screen.getByText('Practice')).toBeTruthy();
});
```

## Code Quality

### ESLint + TypeScript

- TypeScript strict mode enabled
- React and React Native specific rules
- Jest environment configuration
- Automatic style sorting for React Native styles

### Pre-commit Hooks

Husky runs the following on each commit:
- ESLint with auto-fix
- Jest tests for changed files
- Type checking

### CI/CD Ready

All scripts run in CI-friendly mode:
- `yarn test` - exits with proper codes
- `yarn lint` - validates all files
- `yarn typecheck` - validates TypeScript

## Navigation

The app uses React Navigation v6 with bottom tabs:

- **Dashboard**: Progress tracking and overview
- **Practice**: Exam practice modes

## Architecture

The project follows React Native best practices:

- TypeScript for type safety
- Component-based architecture
- Screen-level organization
- Separation of concerns
- Test-driven development

## Contributing

1. Follow TDD approach - write tests first
2. Run `yarn test && yarn lint && yarn typecheck` before committing
3. Use Conventional Commit messages
4. Pre-commit hooks will automatically run quality checks

## Scripts Reference

| Script | Description |
|--------|-------------|
| `yarn test` | Run Jest tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint issues |
| `yarn typecheck` | Run TypeScript compiler |
| `yarn start` | Start Metro bundler |
| `yarn android` | Run on Android |
| `yarn ios` | Run on iOS |

## License

MIT