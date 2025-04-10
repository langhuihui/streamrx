module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', 'karma-typescript'],
    files: [
      { pattern: 'src/**/*.ts' },
      { pattern: 'test/**/*.ts' }
    ],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
    karmaTypescriptConfig: {
      tsconfig: './tsconfig.json',
      compilerOptions: {
        module: 'commonjs'
      },
      bundlerOptions: {
        transforms: [
          require('karma-typescript-es6-transform')()
        ]
      }
    },
    reporters: ['progress', 'karma-typescript'],
    browsers: ['ChromeHeadless'],
    singleRun: true,
    logLevel: config.LOG_INFO
  });
}; 