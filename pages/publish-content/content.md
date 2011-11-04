Each page requires it's own folder in the `./pages` directory with two important files:

`./pages/:my-article/content.md`
`./pages/:my-page/page.json`

### content.md

The articles themselves are parsed as [github-flavored markdown](http://github.github.com/github-flavored-markdown/), which is arguably the best markdown dialect around. Just write your article content in this file as markdown and save it, and blacksmith will do the rest!

For example:

     ## Part 1:
     I can **type in bold**!

     ## Part 2:
     *This text is emphasized!*

**That's it!** Writing content is easy.

### page.json

Each page has an associated metadata file found in `page.json`. 

**For example:**

    {
      "title": "My Article",
      "author": "Nodejitsu",
      "date": "Fri Aug 19 17:36:01 PDT 2011"
      "tags": ["node", "nodejitsu", "blacksmith"]
    }

Here is a list of metadata tags that Blacksmith may use:

* **renderer**: By default, pages are rendered with the "content" renderer, which handles articles and directory views. Specify a renderer if you want the page to show special content. Valid examples include:
    * **all**: Render a page that shows *all* the articles.
* **title**: The title of the article.
* **author**: The author of the article. Cross-referenced with [authors metadata](/manage-authors).
* **date**: The date on which the article was published. This string should be parseable by javascript's [`Date` constructor](http://www.hunlock.com/blogs/Javascript_Dates-The_Complete_Reference).
* **tags**: A list of meta tags to attach to your article page.
* **preview**: If the renderer is set to **all** and **preview** is truthy, then Blacksmith will render the page with short "preview" versions of all the articles, with a link to the main article page.
