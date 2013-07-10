# blacksmith

A generic static site generator built using `flatiron`, `plates`, and `marked`.

* [Creating a site with Blacksmith](#creating-a-site-with-blacksmith)
* [Components of a Blacksmith site](#components-of-a-blacksmith-site)
  * [Site Settings](#site-settings)
  * [Layouts](#layouts)
  * [Pages](#pages)
    * [All Page Options](#all-page-options)
  * [Content](#content)
    * [Specifying Metadata](#specifying-metadata)
    * [Content Snippets](#content-snippets)
    * [Code Highlighting](#code-highlighting)
    * [Truncated Content](#truncated-content)
  * [Partials](#partials)
    * [Customizing Partials](#customizing-partials)
    * [Metadata References](#metadata-references)
    * [Conditional Metadata](#conditional-metadata)
* [How does blacksmith render my Site?](#how-does-blacksmith-render-my-site)
  * [Rendering Procedure](#rendering-procedure)
  * [Rendering Data Structure](#rendering-data-structure)
* [Tests](#tests)

## Creating a site with `blacksmith`

Blacksmith sites have a specific directory structure for storing the various parts of your site: settings, layout, partials, pages, and content. Content exists in two forms:

* Markdown files that `blacksmith` will render.
* Supporting content such as css and images.

All content will be rendered into `/public`. To render a blacksmith site:

**Install Blacksmith**

``` bash
  $ npm install blacksmith -g
```

**Render a Site**

``` bash
  #
  # Defaults to `cwd`
  #
  $ blacksmith /path/to/your/site
```

Here's an example of a simple blog that `blacksmith` would render. 

``` bash
/site-name
  #
  # Settings for this blacksmith site.
  #
  .blacksmith
  /content
    #
    # Actual Markdown content to render.
    #
    /posts
      a-post.md
      another-post.md
  /layouts
    #
    # Layouts to use for pages. You can specify 
    # multiple layouts, but default.html is ... the default.
    #
    default.html
  /metadata
    #
    # Metadata entities which can be reference in content metdata
    #
    /authors
      author-name.json
  /partials
    #
    # HTML for partials inside of pages
    #
    post.html
    sidebar.html
  /pages
    #
    # Metadata for rendering specific pages
    #
    index.json
    post.json
  /public
    #
    # Any additional files for viewing the site. All
    # rendered HTML will be placed here. e.g.:
    #
    /css
      styles.css
    /img
      favicon.png
```

## Components of a `blacksmith` site

Each `blacksmith` site defines a hierarchical set of components which can be composed **to create any type of site you want!** A couple of examples:

* A Blog
* A Documentation Site
* A Custom Splash Page or Content Site

Lets examine each of these components and where they are stored in your filesystem:

### Site Settings

The settings for a given `blacksmith` site are stored in the `.blacksmith` file located in the root directory of your site. 

``` js
  {
    //
    // Default Layout. Specifying a name here will cause Blacksmith to attempt to read
    // /layouts/layout-name.json for rendering info. If no layout-name.json file is found
    // blacksmith will use `/layouts/layout-name.html`
    //
    // Default: default
    //
    "layout": "layout-name",
    "pages": {
      //
      // These settings will be used for all content in
      // /content/posts
      //
      "post": {
        "layout": "custom-layout-for-posts",
        "partials": {
          "html-id": "additional-partials",
          "another-id": "for-this-page-only"
        }
      }
    }
  }
```

You can define settings for all components of your site in the `.blacksmith` file or break them out into individual files within component directories. For example, the above example is equivalent to:

**/.blacksmith**

``` js
  {
    "layout": "layout-name"
  }
```

**/pages/post.json**

``` js
 {
  "layout": "custom-layout-for-posts",
  "partials": {
    "html-id": "additional-partials",
    "another-id": "for-this-page-only"
  }
}
```

### Layouts

Layouts are fully-formed HTML files; **_they are the top of the rendering hierarchy._** All content will be inserted into a layout inside of the HTML element with the `id="content"`. Lets look at the worlds simplest layout:

``` html
  <html>
  <head>
  	<title>Simple Layout</title>
  	<link rel="stylesheet" href="css/styles.css">
  </head>
  <body>
    <div id="content">
      <!-- All rendered content place here-->
    </div>
  </body>
  </html>  
```

Settings for a layout may be specified in your `.blacksmith` file or in `/layouts/layout-name.json`. Lets look at an example:

**/layouts/layout-name.json**
**NOTE: These properties are not yet supported. See [Roadmap](#roadmap) for more details.**

``` js
  {
    //
    // The "template" property specifies which HTML file within the /layouts directory
    // to use when rendering this layout. In this way a single HTML file can be reused with 
    // different partials.
    //
    // If no template is specified then blacksmith will look for /layouts/layout-name.html
    // when rendering.
    //
    "template": "shared-layout.html",
    //
    // The "partials" property specifies which HTML partial (or partials) to insert at a given
    // id within the layout. These partials will be rendered with the metadata for a given
    // individual page with content.
    //
    "partials": {
      "sidebar-container": "sidebar",
      //
      // Multiple partials can be concatentated into a single HTML id.
      //
      "multi-container": ["partial1", "partial2"]
    }
  }
```

### Pages

**Pages** allows you to specify **what type of content** you wish to render and where to render it within a given layout. As with layouts, pages may be specified in your `.blacksmith` file or in `/pages/page-name.json`. Lets look at two examples from our blog:

**/pages/index.json**

The above example demonstrates particular interest: **index.json will always be used to render index.html.** The following example specifies that `blacksmith` should render a list of `post` content, which should be truncated and limited to a maximum of 20 posts. **Note: All lists are sorted descending by the date the content was created.**

``` js
  {
    //
    // The "content" property specifies what blacksmith should render
    // inside the HTML element with id="content"
    //
    "content": {
      "list": "post",
      "truncate": true,
      "limit": 20
    }
  }
```

**/pages/post.json**

The rendering information for an individual post is much simpler than our `index.json`. By creating this file, `blacksmith` will:

1. Render all Markdown files in `/content/posts` using the partial found at `/partials/post.html`.
2. Render the partial found at `/partials/sidebar.html` with the metadata for each Markdown file in `/content/posts` and append it to the HTML element with id="content"

``` js
  {
    "partials": {
      "content": "sidebar"
    }
  }
```

It is important to take note of the convention:

``` 
  Convention: By default, page content will be rendered in a partial of the same name. 
```

Alternatively we could have specified an explicit partial to use. If no partial is specified and the default partial is not found then **no metadata would be rendered** (in this case author name, date of post, etc).

#### All Page Options
A list of all available options that can be specified in a `page.json` file are listed below:

``` js
  {
    //
    // Specifies the layout for the page. 
    // Default: Layout for the site.
    //
    "layout": "custom-layout-for-page",
    
    //
    // Specifies a mapping of HTML ids to partial(s). If "content" is specified
    // then it is appended after the rendered markdown content.
    //
    "partials": {
      "html-id": "partial-name",
      "another-id": ["multiple-partials"]
    },
    
    //
    // Case 1: Rendering content with a partial
    //
    "content": "custom-partial"
    
    //
    // Case 2: Consolidating multiple content sources in a list.
    //
    "content": {
      "list": "post",
      "truncate": true,
      "limit": 20
    }
  }
```

### Content

In `blacksmith`, "content" is raw Markdown and supporting files (e.g. images) located within the `/content` directory. Content for individual pages should be placed under `/content/page-name`. 

In our example all content for the `post` page should be placed under `/content/posts`. It is important to take note of the convention:

``` 
  Convention: Page names are always singular, but their content folder will always be plural.
```

The content for an individual page may also be a directory where supporting files (such as images can be placed). For example if we wanted to create a post with images, the directory structure would be:

```
/site-name
  /content
    /posts
      /post-with-supporting-files
        content.md
        an-image.png
        another-image.png
        some-code.js
```

The directory structure will be respected, but the `/content` prefix will be dropped. So the full-url for `an-image.png` would be `http://your-site.com/post-with-supporting-files/an-image.png`.

#### Specifying Metadata

**All metadata associated with content is stored within the individual Markdown files as link definitions prefixed with 'meta:'.** Because of a small limitation in the Markdown format you must use the following syntax to specify metadata:

```
  [meta:author] <> (Author Name)
  [meta:title] <> (A Really Long Title Different from the Filename)
  [meta:nested:values] <> (Are also supported)
```

#### Content Snippets

In large content pages it is often useful to have examples or references to other files to be inserted later in rendering. A classic example is **code samples in a blog post.** This is easy in `blacksmith` using **Content Snippets.** Consider the content:

```
  /content
    /dir-post
      index.md
      whatever.js
```

``` markdown
  This is a piece of markdown content to be rendered later. It has a reference to the file "whatever.js"
  
  <whatever.js>
```

In this example `<whatever.js>` in `index.md` would be replaced with the contents of `/content/dir-post/whatever.js`. **Note: Only files with text extensions (.js, .rb, .txt, etc) less than 1MB will be inserted.**

#### Code Highlighting

Because `blacksmith` uses `marked` we get the benefit of **Github Flavored Markdown** through `highlight.js`. By default code highlighting is enabled. All you need to do is add some CSS for your site. For example:

``` css
  pre {
    border: 1px solid #e0ded3;
    border-radius: 4px;
    margin: 10px 10px 40px 10px;
    padding: 10px;
    background-color: #f0efe8;
    overflow: auto;
    font-size: 14px;
    font-family: Consolas, "Liberation Mono", Courier, monospace;
  }

  code {
    white-space: pre;
    color: rgba(0,0,0, 1);
  }

  code .keyword              { font-weight: bold; color: #6089d4; }
  code .string, code .regexp { color: green }
  code .class, code .special { color: #6089d4 }
  code .number               { color: red }
  code .comment              { color: grey }
```

#### Truncated Content

It is necessary to truncate large content pages when rendering them within compilations (i.e. lists). This is supported by `blacksmith` with a special identifier in your Markdown files. For example:

**/content/posts/dir-post/index.markdown**

``` markdown
  A simple post that is truncated with content snippets and metadata that is not used in the post.

  ##!!truncate

  <file1.js>
  A second file reference with spaces
  < file2.js  >

  [meta:author]: <> (Charlie index)
```

When rendered in a page like `index.json` with `{ truncate: true }` only the content above `##!!truncate` will be rendered.

### Partials

**Partials** are HTML fragments which are inserted into a layout, a page, or another partial. **All partials are rendered with `plates`**.

#### Default Metadata

``` js
  {
    "page-details": {
      "author": {
        //
        // Contents of /metdata/authors/author-name.json
        //
      },
      "href": "/full/path/to/page",
      "date": "Fully qualified date page was published",
      "files": {
        "js": [{ "filename": "file1.js", "url": "/full/path/to/file1.js" }],
        "img": [{ "filename": "img1.png", "url": "/full/path/to/img1.png" }]
      }
    }
  }
```

#### Customizing Partials

All metadata is placed into partials using a set of simple `plates` conventions. In the future it may be possible to customize these conventions but that is not currently planned.

* _Map URL-like string keys to href="keyname":_ `map.where('href').is(key).use(key).as('href');`
* _Insert "content" into class="content":_      `map.class('content').use('content').as('value');`
* _Map string keys to class="keyname":_         `map.class(key).use(key)`
* _Map everything else to class="keyname":_     `map.class(key).use(key);`
* _Recursively map Array keys:_                 `exports.map(metadata[key][0], map);`
* _Recursively map Object keys:_                `exports.map(metadata[key], map);`

#### Conditional Metadata

Some content should only exist in partials when a given key is present in the metadata. This is supported by `blacksmith` in the following way: _The keys in `remove` must be specified at the fully qualified path into an Object._

**/partials/partial-name.json**

``` js
  {
    "remove": {
      "page-details": {
        "author": ["github", "twitter"]
      }
    }
  }
```

In the corresponding HTML file for the partial any elements with "class=if-[keyname]" will be removed if there is no value for `keyname`. In the above example using the following template:

**/partials/partial-name.html**

``` html
  <div class="page-details">
    <div class="author">
      <h3>About the author</h3>
      <div class="name">Author Name</div>
      <div class="if-github">
        <a href="github-url" class="github">Author Github</a>
      </div>
      <div class="if-twitter">
        <a href="twitter-url" class="twitter">Author Twitter</a>  
      </div>
    </div>
  </div>
```

and this set of metadata:

``` js
  {
    "page-details": {
      "author": {
        "name": "Charlie Robbins",
        "github": "indexzero",
        "github-url": "https://github.com/indexzero"
      }
    }
  }
```

The output would be the following. **Notice how everything inside `if-twitter` has been removed.**

``` html
  <div class="page-details">
    <div class="author">
      <h3>About the author</h3>
      <div class="name">Charlie Robbins</div>
      <div class="if-github">
        <a href="https://github.com/indexzero" class="github">indexzero</a>
      </div>
    </div>
  </div>
```

#### Metadata References

It is useful when writing a content page to use a key to reference a larger section of metadata stored elsewhere. These other sections of metadata are called **metadata references** and are loaded by `blacksmith` from `/metadata`. For example:

**/metdata/dogs/sparky-mcpherson.json**
```
  {
    "name": "sparky-mcpherson",
    "breed": "labridoodle",
    "color": "brown",
    "age": "3",
    "temperment": "friendly"
  }
```

**/content/posts/a-post.md**

``` markdown
  (... Rest of Content ...)  
  [meta:dog] <> (Sparky McPherson)
```

When the content for this page finally gets rendered to a partial the metadata will not be `{ 'dog': 'sparky' }`, it will be the entire object stored in `/metadata/dogs/sparky.json`. By convention:

```
  Convention: For a given `key:value` blacksmith will lookup metadata references for the `value`
  in the directory named with the plural of that `key`. 
```

In the above example the `key:value` pair is `dog:Sparky Mcpherson` so we attempt to lookup `sparky-mcpherson` within `/metadata/dogs/sparky-mcpherson.json`.

**Note:** "Authors" is a special metadata reference which will always be within the `metadata.page-details`.

## How does `blacksmith` render my Site?

**It's safe to skip this if you're not tinkering with `blacksmith` internals.** 

### Rendering Process

In order to render list pages with all options supported by `blacksmith` it is necessary to perform multiple rendering passes on a given site to fully render it. Lets examine that process start to finish:

* **1. Rendering starts**

Rendering starts when `blacksmith('/full/path/to/your/site', function () { ... })` is invoked. This tells `blacksmith` where the root directory for a given site is.

* **2. Load all HTML and rendering settings**

Inside `Site.prototype.load` will load all HTML and rendering settings stored in:

  * .blacksmith
  * /layouts/*.json || *.html
  * /pages/*.json
  * /partials/*.html

We need to load all of these files before any rendering can begin because they store the necessary settings for rendering.

* **3. Read everything under `/content`**

Before layout, page, and partial rendering can take place all content (i.e. Markdown and supporting files) must be known to `blacksmith`. In our example how can we render the page represented by `/pages/index.json` without all rendered content? `Site.prototype.readContent` recursively reads `/content` building this data structure:

```
/content
  /posts
    a-post.md
    another-post.md
    /dir-post
      file1.js
      file2.js
      index.markdown
```

``` js
{
  posts: {
    "a-post": { _content: { html: "..", markdown: "..", metadata: { ... } } },
    "another-post": { _content: { html: "..", markdown: "..", metadata: { ... } } }
    "dir-post": {
      _content: {
        html: "HTML rendered from Markdown", 
        markdown: "Markdown in index.markdown",
        metadata: {
          "page-details": {
            source: "/dir-post/index.markdown",
            title: "Title of page in metadata" || "href of page",
            date: "Saturday, November 10, 2012",
            href: "/dir-post",
            "files": {
              "js": [{ "filename": "file1.js", "url": "/full/path/to/file1.js" }],
              "img": [{ "filename": "img1.png", "url": "/full/path/to/img1.png" }]
            }
          }
        }
      },
      _files: ['file1.js', 'file2.js']
    }
  }
}
```

* 4. **Render all pages**

### Rendering Data Structure
As we discussed `blacksmith` uses hierarchical rendering components. Each component inherits the relevant properties from its parent entity. The full hierarchy is:

* Site
  * Layout
    * Partial
    * Page
      * Content
      * Partial

Notice that partials can _be specified by both layouts and pages._ In the event of a conflict the partials specified by the page will always be preferred.

Lets examine a fully-formed data structure for rendering each of our rendering data structures:

**Page**

``` js
  {
    //
    // There are all inherited from Site and Layout that this 
    // page is associated with
    //
    "layout": "layout-name"
    "html": {
      "layouts": { ... },
      "partials": { ... }
    },
    "partials": {
      "html-id": "sidebar",
      "another-id": "breadcrumbs",
      "multiple-partials": ["that-can", "be-overridden"]
    },
    //
    // Metadata is extracted from link definitions on the page prefixed,
    // with "meta:{key}". The {key} is what is stored in the metadata property.
    //
    // e.g. [meta:author] <> (indexzero)  
    //
    "metadata": {
      "author": "indexzero"
    }
  }
```

## Tests
All tests are written with [vows][0] and can be run with [npm][1]:

``` bash
  $ npm test
```

## Roadmap

1. RSS Feed
2. Only render "dirty" files (i.e. those not modified since last render).
3. Customize list sorting by key and direction.
4. Support nested partials.
5. Support rendering page depths greater than 1.
6. Support "template" and "partials" in layouts.
7. Investigate this bug: https://github.com/flatiron/plates/issues/93

#### License: MIT
#### Author: [Charlie Robbins](http://github.com/indexzero)

[0]: http://vowsjs.org
[1]: http://npmjs.org
