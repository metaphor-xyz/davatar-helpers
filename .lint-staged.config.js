module.exports = {
  'packages/**/*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix --max-warnings 0'],
  'packages/react/**/*.{js,jsx,ts,tsx}': [() => "bash -c 'cd packages/react && tsc'"],
};
