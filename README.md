# Burgir-Client
Repository for the Burgir API client, built with React in TypeScript.

Setting up:

1. Check node version:
```bash
node --version
```
At least v16.00 should be displayed for this project to work properly. If a suitable version isn't found, it can be installed for example from the node website: https://nodejs.org/en/download

2. Install packages:
At least these packages must be installed in the project directory, as the project utilizes them:
```bash
npm install react-router-dom
npm install axios
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion
```
Purposes of the packages:


react-router-dom: enables routing

axios: enables requests, important for API

tailwindcss: provides a set of pre-designed classes to style HTML elements

postcss: transforms styles with JS plugins

autoprefixer: parses CSS and automatically applies vendor prefixes to CSS rules

framer-motion: enables smooth animations

3. Run the server
```bash
npm run dev
```

4. Set up ESLint (done already in repository, but just instructions on how this was done)

This project uses ESLint linter to find code issues.

Installation instructions from https://typescript-eslint.io/getting-started/#quickstart:

Open a terminal at the project root, and run
```
npm install --save-dev eslint @eslint/js typescript typescript-eslint
```
Create a file called 
```eslint.config.mjs```
to project root, and set this to its content:
``` ts
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
);
```
Run ESLint with:
```
npx eslint .
```
**At any moment of pushing changes to this repository, there should not be any issues printed out by ESLint!**
