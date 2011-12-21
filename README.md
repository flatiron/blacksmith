# blacksmith

*A static site generator built with Node.js, JSDOM, and Weld.*

<!-- todo: new screenshot -->

Blacksmith is a static site generator designed for simplicity and ease of use. Blacksmith will generate your content in seconds as a stand-alone static site ( comprised of HTML / CSS ) that can be hosted anywhere with no dependencies. Articles are edited as Markdown files, and themes are just plain HTML and CSS files (no inane microtemplates or strange markup languages).

Static sites are generated using Weld and JSDOM. Blacksmith also ships with a built in Node.js static file server, so Blacksmith can host itself, if you'd like. 


## Features

 * Easy to use
 * Can be hosted anywhere, since it generates static HTML/CSS
 * Write and Edit articles on the file system using markdown
 * JSDOM / Weld based
 * Easily create custom themes using plain HTML and CSS ( no micro-templating ! )
 * Ships with a robust node.js static server suitable for production

## Getting Blacksmith

    git clone git@github.com:flatiron/blacksmith.git
    cd blacksmith

One of blacksmith's dependencies is a bundle of site scaffolds, which is non-published. So:

    mkdir node_modules
    cd node_modules
    git clone git@github.com:flatiron/blacksmith-sites.git
    cd ..

Now, link it up:

    sudo npm link

This will link up the development version of blacksmith.
    
## Usage

Now that you have cloned your own copy of Blacksmith, getting started is easy!

### Generating a new static site

    blacksmith generate

*This command will generate a new version of your blog using source files from the `./pages` folder and put the generated content into `./public/`.*
    
### Serving your static site

Now simply drop `./public` into any public HTTP server and your site is good to go!

If you need a HTTP server, just use Blacksmith's built-in Node.js HTTP server with:

    blacksmith serve
   
*This command will start up a static http server that will serve the contents of `./pages`.*


# Want to learn more?

The documentation for blacksmith is hosted as a blacksmith site. You can access it by running 'blacksmith init' and choosing the "docs" site.

#### Author: Nodejitsu Inc.
