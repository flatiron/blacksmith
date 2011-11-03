Each page requires it's own folder in the `./pages` directory with two important files:

`./pages/:my-article/content.md`
`./pages/:my-page/page.json`

### page.json

Each page has an associated metadata file found in `page.json`. 

**For example:**

    {
      "title": "My Article",
      "author": "Nodejitsu",
      "date": "Fri Aug 19 17:36:01 PDT 2011"
      "tags": ["node", "nodejitsu", "blacksmith"]
    }

### article.md

The articles themselves are parsed as [github-flavored markdown](http://github.github.com/github-flavored-markdown/), which is arguably the best markdown dialect around. Just write your article content in this file as markdown and save it, and blacksmith will do the rest!

**For example:**

     ## Part 1:
     I can **type in bold**!

     ## Part 2:
     *This text is emphasized!*

# That's it!
