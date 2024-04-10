Please follow the instructions below to view the app within your web browser: 

1. Clone the Repository
git clone https://github.com/robertkay/AFSL-725-MUI.git

2. Install Dependencies
Before running the app, install all necessary dependencies with:
npm install

3. Build the React App
Once dependencies are installed, the next step is to build the React app. This step compiles the React code into static files that can be served by your server script. Run:
npm run build

This command looks for the build script in your package.json and executes it, generating a build directory with your compiled app.

4. Run the Server Script
After the build process completes, the final step is to run: 
node mydigitalstructure-local.js