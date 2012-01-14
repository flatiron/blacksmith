# blacksmith

*A static site generator built with Node.js, JSDOM, and Weld.*

## <http://blacksmith.nodejitsu.com>

Blacksmith is a static site generator designed for simplicity and ease of use. Blacksmith will generate your content in seconds as a stand-alone static site ( comprised of HTML / CSS ) that can be hosted anywhere with no dependencies. Articles are edited as Markdown files, and themes are just plain HTML and CSS files (no inane microtemplates or strange markup languages).

Static sites are generated using Weld and JSDOM. Blacksmith also ships with a built in Node.js static file server, so Blacksmith can host itself, if you'd like. 


## Features

 * Easy to use
 * Can be hosted anywhere, since it generates static HTML/CSS
 * Write and Edit articles on the file system using markdown
 * JSDOM / Weld based
 * Easily create custom themes using plain HTML and CSS ( no micro-templating ! )
 * Ships with a robust node.js static server suitable for production

## Installing Blacksmith

    npm install blacksmith -g

## Usage

Now that you have blacksmith, you can use the cli tool to get started!

### Create a new site

    blacksmith init

### Create a new page

    cd myBlog/pages
    blacksmith post

### Generate a static site

*This command will generate a new version of your blog using source files from the `./pages` folder and put the generated content into `./public/`.*

    # In your site's root
    blacksmith generate
    
### Serving your static site

You can serve what's in `./public` on any static HTTP server and it's good to go!

Alternately, blacksmith comes with a simple http server:

    blacksmith preview

and can be deployed to Nodejitsu as-is:

    jitsu deploy

# Want to learn more?

The documentation for blacksmith is hosted as a blacksmith site. [Check it out!](http://blacksmith.jit.su)

#### Author: Nodejitsu Inc.
