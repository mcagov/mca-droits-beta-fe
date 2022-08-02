# DROITS
DROITS is a web application that enables the Marine and Coastguard Agency to manage sea wreckage reported by members of the public. It has two groups of users: 
- members of the public who find items of wreckage. They use the main front end UI contained in this repo.
- receivers of wreck. They use a Microsoft back office component to the system not contained in this repo.

The application shows a form that members of the public fill out and submit in order to report wreckages.

# Ubiquitous Language
- DROIT: _to-do_
- Wreck: a piece of sea wreckage washed up on land. In the code, this is referred to as 'property'
- Receivers of wreck: Marine and Coastguard Agency employees who receive the reports of wreckage submitted via this app and decide what to do with it

# Tools and Technologies Used
- Node.js
- Express.js
- HTML
- Nunjucks
- Sass
- Microsoft Power Automate Flows
- Microsoft Power Apps

# Architecture
The system uses the following components:
- A public-facing front end web app written in HTML, Nunjucks and Sass
- A Node + Express API that serves two purposes:
    - it acts as a router, rendering specific HTML views for the different steps in the form
    - it sends the public user's report of a piece of wreckage to Microsoft Power Automate Flows in a POST request. 
- This sets off a sequence of automated tasks in MS Power Automate Flow, which allows the receivers of wreck to examine the public user's report.


# Known Issues
- Inconsistent domain language (wreck /= property)

## Quick Start 🚀

#### Installs dependencies

```bash
npm install
```

#### Starts server

```bash
npm run start
```

#### Starts both express server and frontend

```bash
npm run dev
```

#### Build static assets for production

```bash
npm run build
```
