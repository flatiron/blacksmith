async = require 'async'
fs = require 'fs'

generate_tag_data_ = (callback)->
    fs.readdir "topics/", (err, results)->
        if err
            return res.send 404, {}, err
        
        tags = {}

        iter = (dir, callback)->
            fs.readFile "topics/"+dir+'/metadata.json', 'utf8', (err,json)->
                if err
                    return callback err

                try
                    obj = JSON.parse json
                catch e
                    return callback(e)

                for tag in obj.tags
                    tags[tag] ?= []
                    tags[tag].push dir
                callback()

        async.forEach results, iter, (err)->
            if err
                console.log err
                return callback {}
            return callback tags

generate_tag_data = ->
    generate_tag_data_ (tags)->
        exports.tagid = tags
        temp = []
        for tag of tags
            temp.push tag
        exports.names = temp
        setTimeout generate_tag_data, 1000
generate_tag_data()

exports.tagid = {}
exports.names = []
