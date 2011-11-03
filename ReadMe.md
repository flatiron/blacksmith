# Blacksmith

*A static blog generator built with Node.js, JSDOM, and Weld.*

Blacksmith is a static blogging engine designed for simplicity and ease of use. Blacksmith will generate your blog in seconds as a stand-alone static site ( comprised of HTML / CSS ) that can be hosted anywhere with no dependencies. Articles are edited as Markdown files, themes are just plain HTML and CSS files (no inane microtemplates or strange markup languages).

Static sites are generated using Weld and JSDOM. Blacksmith also ships with a built in Node.js static file server, so Blacksmith can host itself, if you'd like. 


## Features

 * Easy to use
 * Can be hosted anywhere, since it generates static HTML/CSS
 * Write and Edit articles on the file system using Github Flavored Markdown
 * JSDOM / Weld based
 * Easily create custom themes using plain HTML and CSS ( no micro-templating ! )
 * Ships with a port of the beautiful [Scribbish](http://quotedprintable.com/pages/scribbish) theme by Jeffrey Allan Hardy
 * Ships with a robust node.js static server suitable for production

## Installation

    git clone git@github.com:nodejitsu/blacksmith.git 
    cd blacksmith
    
## Usage

Now that you have cloned your own copy of Blacksmith, getting started is easy!

### Generating a new blog

    node bin/generate <blogname>

*This command will generate a new version of your blog using source files from `<blogname>` folder and put the generated blog into `<blogname>/public/`.* If no folder is specified, the folder defaults to `./sites/my-awesome-blog`.
    
### Serving up your blog

Now simply drop `/blogname/public` into any public HTTP server and your blog is good to go!

If you need a HTTP server, just use Blacksmith's built-in Node.js HTTP server with:

    node bin/server <path to blog>
   
*This command will start up a static http server that will serve the contents of /blacksmith/sites by default.*

**Note:** You can pass in many options to node bin/server, such as `port` and `path`. Type `node bin/server --help`

# Managing your Blog


#### Author: Nodejitsu Inc.
