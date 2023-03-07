module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
		'node': true
	},
	'extends': [
		'eslint:recommended'
	],
	'globals': {
		'Ammo': true
	},
	'overrides': [
		{
			'files': ['**/*.ts'],
			'env': {
				'browser': true,
				'es2021': true,
				'node': true
			},
			'extends': [
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:@typescript-eslint/recommended'
			],
			'parser': '@typescript-eslint/parser',
			'parserOptions': {
				'project': './tsconfig.json'
			},
			'plugins': [
				'@typescript-eslint'
			],
			'rules': {
				'@typescript-eslint/no-inferrable-types': 'off',
				'@typescript-eslint/semi': ['error', 'always']
			}
		}
	],
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module'
	},
	'root': true,
	'rules': {
		'comma-dangle': ['error', 'never'],
		'comma-style': ['error', 'last'],
		'eol-last': ['error', 'never'],
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'key-spacing': ['error', { 'beforeColon': false }],
		'max-len': ['error', { 'code': 120 }],
		'max-statements-per-line': ['error', { 'max': 1 }],
		'no-multiple-empty-lines': ['error', { 'max': 3 }],
		'no-trailing-spaces': 'error',
		'object-curly-spacing': ['error', 'always'],
		'prefer-const': ['error'],
		'quotes': ['error', 'single'],
		'quote-props': ['error', 'consistent'],
		'semi': ['error', 'always'],
		'space-infix-ops': 'error',
		'spaced-comment': ['error', 'always']
	}
};