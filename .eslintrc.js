module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "idiomatic"
  ],
  "rules": {
    "quotes": [
      "error",
      "double"
    ],
    "newline-after-var": [
      "error",
      "always"
    ]
  },
  "globals": {
    "RisePlayerConfiguration": true
  }
};
