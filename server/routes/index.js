const express = require('express')
const router = express.Router()
const sha224 = require('js-sha256').sha224
const fs = require('fs')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
})


router.post('/createproject', function(req, res, next) {
  const link = sha224(new Date().getTime().toString())
  const file_end = req.body.file.map(elem => ({ index: elem.index, start: elem.start, end: elem.end, content: [] }))
  //CHECK VALID ENTRIES
  
  fs.mkdir(__dirname + '/../files/' + link, { recursive: true }, function (err) {
    if (err) {
      res.send(false)
    } else {
      fs.appendFile(__dirname +'/../files/' + link + '/start.json', JSON.stringify(req.body.file), 'utf8', function (err) {
        if (err) {
          fs.rmdir(__dirname + '/../files/' + link, () => { res.send(false) })
        } else {
          fs.appendFile(__dirname +'/../files/' + link + '/end.json', JSON.stringify(file_end), 'utf8', function (err) {
            if (err) {
              fs.unlink(__dirname + '/../files/' + link + '/start.json', () => {
                fs.rmdir(__dirname + '/../files/' + link, () => { res.send(false) })
              })
            } else {
              res.locals.connection.query("INSERT INTO projects (projectName, projectType, privacy, startLang, endLang, link) VALUES (?)",
                [[req.body.name, req.body.type.toUpperCase(), parseInt(req.body.privacy), req.body.startLang.toUpperCase(), req.body.endLang.toUpperCase(), link]], function(err, result) {
                if (err) {
                  fs.unlink(__dirname + '/../files/' + link + '/start.json', () => {
                    fs.unlink(__dirname + '/../files/' + link + '/end.json', () => {
                      fs.rmdir(__dirname + '/../files/' + link, () => { res.send(false) })
                    })
                  })
                } else {
                  res.send(link)
                }
              })
            }
          })
        }
      })
    }
  })
})

router.get('/project/:link', function(req, res, next) {
  res.locals.connection.query("SELECT id, projectName AS name, projectType AS type, startLang, endLang FROM projects WHERE link=?", [req.params.link], function(err, project) {
    if (err) throw err
    if (project.length == 1) {
      res.locals.connection.query("SELECT startWord, endWord FROM rules WHERE idProject=?", [project[0].id], function(err, rules) {
        if (err) throw err
        fs.readFile(__dirname + '/../files/' + req.params.link + '/start.json', (err, start) => {
          if (err) throw err;
          fs.readFile(__dirname + '/../files/' + req.params.link + '/end.json', (err, end) => {
            if (err) throw err;
            res.send({ project: project[0], rules: rules, jsonStart: JSON.parse(start), jsonEnd: JSON.parse(end) })
          })
        })
      })
    } else {
      res.send(false)
    }
  })
})

module.exports = router
