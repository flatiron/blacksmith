var plates = require('plates');

var map = plates.Map();

var metadata = {
  'page-details': {
    author: {
      github: 'indexzero'
    }
  }
};

map.class('page-details').use('page-details');
map.class('author').use('author');
map.class('github').use('github');
map.where('href').has(/github$/).replace(/github$/, metadata['page-details'].author.github);

console.log(plates.bind(
  [
    '<div class="page-details">',
    '  <div class="author">',
    '    <a href="http://github.com/github" class="github">Author Github</a>',
    '  </div>',
    '</div>'
  ].join('\n'),
  metadata,
  map
));