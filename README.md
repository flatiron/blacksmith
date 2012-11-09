# blacksmith2

A generic static site generator built using `flatiron`, `plates`, and `marked`.

* [Creating a site with Blacksmith](#creating-a-site-with-blacksmith)
* [Components of a Blacksmith site](#components-of-a-blacksmith-site)
  * [Site Settings](#site-settings)
  * [Layouts](#layouts)
  * [Pages and Partials](#pages-and-partials)
  * [Content](#content)

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

Layouts are fully-formed HTML files; _they are the top of the rendering hierarchy._ A layout may specified in your `.blacksmith` file or in `/layouts/layout-name.json`. Lets look at an example:

**/layouts/layout-name.json**
``` js
  {
    //
    // The "template" property specifies which HTML file within the `/layouts` directory
    // to use when rendering this layout. In this way a single HTML file can be reused with 
    // different partials.
    //
    // If no template is specified then blacksmith will look for `/layouts/layout-name.html`
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

### Pages and Partials

Pages and partials are tightly connected to it is prudent to consider them together:

* **Pages** allowed you to specify **what type of content** you wish to render and where to render it within a given layout. 
* **Partials** are HTML fragments which are inserted into a layout, a page, or another partial.


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
