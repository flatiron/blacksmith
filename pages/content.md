*A static site generator built with Node.js, JSDOM, and Weld.*

![](/img/screenshot.png)

Blacksmith is a static site generator designed for simplicity and ease of use. Blacksmith will generate your content in seconds as a stand-alone static site ( comprised of HTML / CSS ) that can be hosted anywhere with no dependencies. Articles are edited as Markdown files, and themes are just plain HTML and CSS files (no inane microtemplates or strange markup languages).

Static sites are generated using Weld and JSDOM. Blacksmith also ships with a built in Node.js static file server, so Blacksmith can host itself, if you'd like. 


## Features

 * Easy to use
 * Can be hosted anywhere, since it generates static HTML/CSS
 * Write and Edit articles on the file system using Github Flavored Markdown
 * JSDOM / Weld based
 * Easily create custom themes using plain HTML and CSS ( no micro-templating ! )
 * Default template is a port of [scribbish](http://quotedprintable.com/pages/scribbish) by [Jeffrey Allan Hardy](http://quotedprintable.com/)
 * Ships with a robust node.js static server suitable for production

## Installation

    git clone https://github.com/nodejitsu/blacksmith.git 
    cd blacksmith
    
## Usage

Now that you have cloned your own copy of Blacksmith, getting started is easy!

### Generating a new static site

    node bin/blacksmith generate

*This command will generate a new version of your blog using source files from the `./pages` folder and put the generated content into `./public/`.*
    
### Serving your static site

Now simply drop `./public` into any public HTTP server and your site is good to go!

If you need a HTTP server, just use Blacksmith's built-in Node.js HTTP server with:

    node bin/blacksmith serve
   
*This command will start up a static http server that will serve the contents of `./pages`.*


# Want to learn more?

The documentation for blacksmith is hosted as a blacksmith site. If you're reading this, all you have to do is click the links in the Table of Contents in the sidebar!

#### Author: Nodejitsu Inc.
