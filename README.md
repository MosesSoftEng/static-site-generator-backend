# static-site-generator-backend
Backend for static site generator.

# Project setup.
```bash
# Clone project
git clone https://github.com/MosesSoftEng/static-site-generator-backend.git static-site-generator-backend
cd static-site-generator-backend

# Add depedencies
npm install

# Development Server
# Run server
npm run dev

# configurations and environments
# Create .env file with properties as given in .env.example.


# Production Server
# Transpile TypeScript(set in rootDir in tsconfig.json) to JavaScript.
npx tsc # or
./node_modules/.bin/tsc

# Execute transpiled typescript aka javascript
node dist/index.js
```
