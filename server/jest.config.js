module.exports = {
  testEnvironment: 'node',
  collectCoverage: false, // enable IntelliJ breakpoint support
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { diagnostics: false }]
  }
}
