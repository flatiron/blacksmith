fs = require 'fs'

fs.readFile 'tags/tags.json', 'utf8', (err,data)->
    if err
        return console.log err
    try
        obj = JSON.parse data
    catch e
        return console.log "invalid json"

    keys = []
    for key of obj
        keys.push key

    keys.sort()

    temp = {}
    for key in keys
        temp[key] = obj[key]

    fs.writeFile 'tags/tags.json.sort', (JSON.stringify temp, null, 2)


