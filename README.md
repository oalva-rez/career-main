# Getting Started
Welcome to the documentation for the Mesa Career app.

## Prerequisites
Ensure you have the following installed on your machine:

* **[Node.js](https://nodejs.org/en/download)** and **[NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)**: Node.js is the runtime that will execute your application, and npm is the package manager that will help manage your app's dependencies.
* **[Git](https://git-scm.com/downloads)** (optional): If you plan to clone the repository from a version control system.
## Setting Up
* ### 1. Clone the Repository (if applicable)
If your project is in a Git repository, start by cloning it:

```
git clone git@github.com:sdmesadev/career.git
```

then 

```
cd career
```

* ### 2. Install Dependencies
Inside the project directory, install the required dependencies:

```
npm install
```

* ### 3. Configure Environment Variables
Retrieve .env file from admin and move the file to the career directory.

⚠️ Note: Never commit your .env file to source control. Ensure it's listed in your .gitignore to keep your secrets safe.

## Running the App
### Development Mode
To run the app in development mode (with live reloading, Nodemon), use:

```
npm run dev
```
