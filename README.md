# blacksmith2

A generic static site generator built using `flatiron`, `plates`, and `marked`.

* [Creating a site with Blacksmith](#creating-a-site-with-blacksmith)

## Creating a site with Blacksmith 

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
    /articles
      an-article.md
      another-article.md
  /layouts
    #
    # Layouts to use for pages
    #
    default.html
    post.html 
  /partials
    #
    # HTML for partials inside of pages
    #
    sidebar.html
    breadcrumbs.html
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

### Rendering Data structures

#### Site 

``` js
  {
    //
    // Default Layout. Specifying a name here will cause Blacksmith to 
    // attempt to read `/layouts/layout-name.json` for rendering info.
    // Default: default
    //
    "layout": "layout-name"
    "pages": {
      //
      // These settings will be used for all pages in
      // /pages/posts
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

### Layout

``` js
  {
    //
    // HTML template to use
    // Default: layouts/layout-name.html
    //
    "template": "shared-filename.html",
    //
    // What partials should we render for pages using this layout?
    //
    "partials": {
      "html-id": "sidebar",
      "another-id": "breadcrumbs",
      "multiple-partials": ["in-a", "single-div"]
    }
  }
```

### Page

This JSON structure is parsed from the Markdown file of the page

``` js
  {
    //
    // There are all inherited from Site and Layout that this 
    // page is associated with
    //
    "layout": "layout-name"
    "template": "shared-filename.html",
    "partials": {
      "html-id": "sidebar",
      "another-id": "breadcrumbs",
      "multiple-partials": ["that-can", "be-overridden"]
    },
    ""
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
