const express = require('express')
      , bodyParser = require('body-parser')
      , csvWriter = require('csv-write-stream')
      , path = require('path')
      , fs = require('fs');

let app = express()

app.use(express.static('public'))

app.use(bodyParser.json());

app.post('/attendees', (req, res) => {
  var writer = csvWriter({sendHeaders: false});
  writer.pipe(fs.createWriteStream(path.join(__dirname, '.data', 'output.csv'), {flags: 'a'}));
  writer.write({name: req.body.name, email: req.body.email, md5: req.body.md5});
  writer.end();
  console.log(req.body);
  res.sendStatus(200);
});

app.get('/download/:secret', (req, res)  => {
  if (req.params.secret === process.env.SECRET) {
    res.sendFile(path.join(__dirname, '.data', 'output.csv'));
  } else {
    res.sendStatus(401);
  }
});

console.log('Visit ' + (process.env.PROJECT_DOMAIN || 'http://localhost:3000'))
app.listen(process.env.PORT || 3000)
