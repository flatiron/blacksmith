module.exports = (context)->
    return "
<html>
<head><title>#{context.title}</title></head>
<body>
    <h1>#{context.title}</h1>
    <p>Written by: #{context.author}</p>
    <p>Last Modified: #{context.date}</p>
    <p>Tags: #{JSON.stringify context.tags}</p>
    <p>Difficulty: #{context.difficulty}</p><br/><br/>
    <pre>#{context.article}</pre>
</body>
</html>"

