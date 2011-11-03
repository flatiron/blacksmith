All the HTML in the `./themes` folder is turned into content pages using [weld](https://github.com/hij1nx/weld)! This means that, instead of using typical templating techniques, all you have to do is use CSS element classes for Weld to grab onto.

## article.html

This is the html file used to template "content" pages. Here is a broad overview of article.html's structure:

### weld object:

* "content": This is populated by blacksmith's gfm parser/generator.
* "metadata"
    * "title": The title of the article.
    * "author": Information about the author of the article.
        * "name": The author's name
        * "email": The author's email address
        * "github": The author's github username
    * "date": The date on which the article was written.
    * "breadcrumb": A list representing the path. This is used to build a "breadcrumb" link.
* "toc": This is populated by blacksmith's Table of Contents generator, and is a nested tree of `<ul>` elements.

### other important html classes:

* ".about": This class is used to surround metadata-display elements, such as ".date", so that these elements may be removed if the particular piece of metadata is unspecified. For example:

> *&lt;span class="about"&gt;by &lt;strong class="author"&gt;&lt;span class="name"&gt;&lt;/span&gt;&lt;/strong&gt;&lt;/span&gt;*

If `author.name` does not exist, then the resulting rendering (or lack thereof) leaves behind:

> *by*

Surrounding this block with *&lt;span class="about"&gt;&lt;/span&gt;* allows for its removal.


## directory.html

This is the html file used to template directory views, in the case where there is no article at this level. Here is a broad overview of directory.html's structure:

### weld object:

* "pwd": The path to the current directory.
* "ls": A list of the current directory's child directories.
* "metadata"
    * "breadcrumb": A list representing the path. This is used to build a "breadcrumb" link.
* "toc": This is populated by blacksmith's Table of Contents generator, and is a nested tree of `<ul>` elements.
