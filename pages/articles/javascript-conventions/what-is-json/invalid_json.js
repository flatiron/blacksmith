{ name: "John Doe", 'age': 32 } // name and age should be in double quotes

[32, 64, 128, 0xFFF] // hex numbers are not allowed

{ "name": "John Doe", age: undefined } // undefined is an invalid value

// functions and dates are not allowed
{ "name": "John Doe"
  , "birthday": new Date('Fri, 26 Aug 2011 07:13:10 GMT')
  , "getName": function() {
      return this.name;
  }
}
