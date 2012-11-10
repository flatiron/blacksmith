# blacksmith2

A generic static site generator built using `flatiron`, `plates`, and `marked`.

* [Creating a site with Blacksmith](#creating-a-site-with-blacksmith)
* [Components of a Blacksmith site](#components-of-a-blacksmith-site)
  * [Site Settings](#site-settings)
  * [Layouts](#layouts)
  * [Pages](#pages)
    * [All Page Options](#all-page-options)
  * [Content](#content)
    * [Specifying Metadata](#specifying-metadata)
  * [Partials](#partials)
    * [Customizing Partials](#customizing-partials)
* [How does blacksmith render my Site?](#how-does-blacksmith-render-my-site)
  * [Rendering Procedure](#rendering-procedure)
  * [Rendering Data Structure](#rendering-data-structure)
* [Tests](#tests)

## Creating a site with `blacksmith` 

Blacksmith sites have a specific directory structure for storing the various parts of your site: settings, layout, partials, pages, and content. Content exists in two forms:

* Markdown files that `blacksmith` will render.
* Supporting content such as css and images.

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
    "layout": "layout-name"
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

Layouts are fully-formed HTML files; **_they are the top of the rendering hierarchy._** A layout may specified in your `.blacksmith` file or in `/layouts/layout-name.json`. Lets look at an example:

**/layouts/layout-name.json**
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

**Pages** allowed you to specify **what type of content** you wish to render and where to render it within a given layout. As with layouts, pages may specified in your `.blacksmith` file or in `/pages/page-name.json`. Lets look at two examples from our blog:

**/pages/index.json**

This example of particular interest: **index.json will always be used to render index.html.** In the below example specifies that `blacksmith` should render a list of `post` content, which should be truncated, limited to a maximum of 20 posts.

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
  Convention: Page content will be rendered in a partial of the same name by default. 
```

Alternatively we could have specified a specific partial to use. If no partial is specified and the default partial is not found then **no metadata would be rendered** (in this case author name, date of post, etc).

#### All Page Options
A list of all options that can be specified in a `page.json` file are listed below:

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

The content for an individual page may also be a directory where supporting files (such as images can be placed). For example if we wanted to create a post with images the directory structure would be:

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
```

### Partials

**Partials** are HTML fragments which are inserted into a layout, a page, or another partial. **All partials are rendered with `plates`**.

#### Default Metadata

``` js
  {
    "page-details": {
      "date": "Fully qualified date page was published",
      "files": {
        "js": [{ "filename": "file1.js", "url": "/full/path/to/file1.js" }],
        "img": [{ "filename": "img1.png", "url": "/full/path/to/img1.png" }]
      }
    }
  }

#### Customizing Partials

```
  TODO: FINISH DOCUMENTING THIS!!!
```

## How does `blacksmith` render my Site?

**It's safe to skip this if you're not tinkering with `blacksmith` internals.** 

### Rendering Process

In order to render list pages with all options supported by `blacksmith` it is necessary to perform multiple rendering passes on a given site to fully render it. Lets examine that process start to finish:

1. Rendering starts

Rendering starts when `blacksmith('/full/path/to/your/site', function () { ... })` is invoked. This tells `blacksmith` where the root directory for a given site is.

2. Load all HTML and rendering settings

Inside `Site.prototype.load` will load all HTML and rendering settings stored in:

  * .blacksmith
  * /layouts/*.json || *.html
  * /pages/*.json
  * /partials/*.html
 
3. Read everything under `/content`

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
            date: new Date(/* Date of post */)
            href: "/dir-post"
            files: {
              "js": ['file1.js', 'file2.js']
            }
          }
        }
      },
      _files: ['file1.js', 'file2.js']
    }
  }
}
```

4. Render all pages

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

1. CLI support
2. Lookup metadata references
3. Support nested metadata keys e.g. [meta:nested:key] <> (Value)
4. Support nested partials
5. Implement "truncate" and "limit" options.
6. Support rendering page depths greater than 1

#### License: MIT
#### Author: [Charlie Robbins](http://github.com/indexzero)

[0]: http://vowsjs.org
[1]: http://npmjs.org