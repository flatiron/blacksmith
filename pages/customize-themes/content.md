All the HTML in the `./themes` folder is turned into content pages using [weld](https://github.com/hij1nx/weld)! This means that, instead of using typical templating techniques, all you have to do is use CSS element classes for Weld to grab onto.

**WARNING: Out of date!** All of these properties are from a much older iteration of this project.

### article.html

This is the html file used to build up article pages.

* "gravatar": The element containing your gravatar
* "title": The title of the article
* "markdown": The rendered markdown of the article
* "author": Contains information about the author, in the form of a [data list](http://www.w3.org/TR/html401/struct/lists.html)
    - "aboutAuthorK": Keys in the author listings (ex: "twitter: ")
    - "aboutAuthorV": Values in the author listings (ex: "[jesusabdullah](http://twitter.com/jesusabdullah/)")
* "aboutArticleDL": Contains information about the article, in the form of a data list.
    - "aboutArticleK": Keys in the article listings (ex: "Date Released: ")
    - "aboutArticleV": Values in the author listings (ex: "Tuesday March 29, 2011")

### index.html

This is the html file used to build the main page of your blog.

* "article": Each instance of this div contains an article.
    - "title": The title of the article
    - "markdown": The rendered markdown of the article
* "archiveListItem": Each instance of this element contains a link to one of the blog articles.

### archive.html

This is the html file used to build the archives page of your blog.

* "article": Each instance of this element contains a summarized article.
    - "gravatar": The element containing the author's gravatar
    - "author": The name of the author
    - "date": The date the article was written
    - "title": The title of the article
    - "markdown": The rendered markdown of the article
