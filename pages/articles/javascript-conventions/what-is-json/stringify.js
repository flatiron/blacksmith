var data = {
  name: "John Doe"
  , age: 32
  , title: "Vice President of JavaScript"
}

var jsonStr = JSON.stringify(data);

console.log(jsonStr);

// prints '{"name":"John Doe","age":32,"title":"Vice President of JavaScript"}'
