Orientation Invite
===

This project powers the "Invite to Hacker Orientation", an event put on by
USC Hackers & Spark SC. The terminal UI pays homage to the command line
interface.


### File structure

There are two main things areas of concern: the node server and the client side
code.

The client uses [`main.js`](https://github.com/uschackers/orientation-invite/blob/master/main.js)
the files located in the [`src`](https://github.com/uschackers/orientation-invite/blob/master/src) directory.
We use `browserify` to transpile all the Javascript we've written and its
dependencies into a single file located at `public/main.js`. You'll notice this
file is not present by default because we don't commit build artifacts. However,
for development and deployment, you'll want to run `npm run build` to generate
that file.

The server side code is contained in [`app.js`](https://github.com/uschackers/orientation-invite/blob/master/app.js)
and it basically just serves files and handles a simple `POST` endpoint to record
successful completion of the invitation.

### Setup & Local Development

```bash
git clone git@github.com:uschackers/orientation-invite.git
cd orientation-invite
npm install
npm run build:dev
npm run start:dev # In a new terminal run
```

### Deployment

Install dependencies:
- Node (v8.4.0)

```bash
npm install
npm install -g forever
npm run build
forever start app.js
```
