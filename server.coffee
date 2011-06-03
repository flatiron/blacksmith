fs = require 'fs'
http = require 'http'
journey = require 'journey'
router = new journey.Router


tag_lookup = require './tags'
template = require './template'

router.map ()->
    this.root.bind (req, res)-> #ugly i know, its a makeshift solutoin for now
        fs.readdir "topics/", (err, results)->
            if err
                return res.send 404, {}, err
            body = ""

            for dir in results 
                #first time i wrote a sync function, sorry
                body += "<a href='article/#{dir}'>" +
                     JSON.parse(fs.readFileSync('topics/'+dir+'/metadata.json')).title+"</a> "
            return res.send 200, {}, body

    this.get("/tag").bind (req, res)->
        res.send 200, {}, JSON.stringify tag_lookup.names

    this.get(/tag\/([a-z]+)/).bind (req, res, tag_name)->
        if tag_lookup.tagid[tag_name]?
            return res.send 200, {}, JSON.stringify tag_lookup.tagid[tag_name]
        return res.send 404, {}, JSON.stringify []

    this.get(/article\/([a-z\-\.]+)/).bind (req, res, name)->
        fs.readFile "topics/"+name+'/article', 'utf8', (err,article)->
            if err
                return res.send 404, {}, err
            fs.readFile "topics/"+name+'/metadata.json', 'utf8', (err,json)->
                if err
                    return res.send 404, {}, err

                try
                    context = JSON.parse(json)
                catch e
                    return res.send 404, {}, "Error parsing metadata.json"

                context.article = article
                return res.send 200, {}, template(context)

server = http.createServer (req, res) ->
    router.handle req, "", (result)->
        res.writeHead result.status, result.headers
        res.end result.body

server.listen 8081
console.log "Listening on localhost:8081"
