module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'plugin:angular/johnpapa',
  ],
  rules: {
    'angular/function-type': [2, 'named'],
    'angular/file-name': 0
  }
};
