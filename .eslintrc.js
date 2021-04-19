module.exports = {
    "env": {
        "mocha": true,
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 12
    },
    "rules": {
        "no-console": "warn",
        "no-nested-ternary": "warn",
        "no-param-reassign": "warn",
        "no-magic-numbers": "error",
        "no-case-declarations": "off"
    }
};
