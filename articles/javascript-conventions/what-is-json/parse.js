var jsonStr = '{"name":"John Doe","age":32,"title":"Vice President of JavaScript"}';

var data = JSON.parse(jsonStr);

console.log(data.title);

// prints 'Vice President of JavaScript'
