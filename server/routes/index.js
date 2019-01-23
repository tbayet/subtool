var express = require('express');
var router = express.Router();
const sha224 = require('js-sha256').sha224

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/createproject', function(req, res, next) {
  const link = sha224(new Date().getTime().toString())
  console.log(link)
  //CHECK VALID ENTRIES
  //file
  //type

  //create link with date + encodage

  //serve file in api
  //:3000/files/ LINK /new + LINK /end
  //create files and save
  /*
  res.locals.connection.query("INSERT INTO projects (projectName, projectType, privacy, startLang, endLang, startJson, endJson, link) VALUES (?)",
    [[req.body.name, req.body.type.toUpperCase(), parseInt(req.body.privacy), req.body.startLang.toUpperCase(), req.body.endLang.toUpperCase(), startLink, endLink, link]], function(err, result) {
      if (err) throw err; // delete repertory
      // return link
      res.send(link)
  })*/
  res.send(true)
})

module.exports = router;
