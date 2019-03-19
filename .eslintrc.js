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
    "func-names": "off",
    "newline-after-var": [
      "error",
      "always"
    ]
  },
  "globals": {
    "RisePlayerConfiguration": true,
    "TEMPLATE_PRODUCT_CODE": true,
    "TEMPLATE_VERSION": true
  }
};
