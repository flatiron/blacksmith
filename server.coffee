async = require 'async'
fs = require 'fs'
journey = require 'journey'
http = require 'http'
template = require './template'

router = new journey.Router

tag_lookup = require './tags'

router.map ()->
    this.root.bind (req, res)->
        fs.readdir "topics/", (err, results)->
            if err
                return res.send 404, {}, err
            body = ""
            for dir in results
                body += "<a href='article/#{dir}'>#{dir}</a> "
            return res.send 200, {}, body
        fs.readFile 'index.htm', 'utf8', (err,data)->
            if err
                return res.send 404, {}, err
            return res.send 200, {}, data

    this.get("/tag").bind (req, res)->
        res.send 200, {}, JSON.stringify tag_lookup.names

    this.get(/article\/([a-z\-\.]+)/).bind (req, res, name)->
        fs.readFile "topics/"+name+'/article', 'utf8', (err,article)->
          fs.readFile "topics/"+name+'/metadata.json', 'utf8', (err,json)->
            json ?= "{}"
            context = JSON.parse(json)
            context.article = article
            if err
                return res.send 404, {}, err
            return res.send 200, {}, template(context)

server = http.createServer (req, res) ->
    router.handle req, "", (result)->
        res.writeHead result.status, result.headers
        res.end result.body

server.listen 8081
console.log "Listening on localhost:8081"
