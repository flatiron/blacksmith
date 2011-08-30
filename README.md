# docs

[http://docs.nodejitsu.com](http://docs.nodejitsu.com)

**community powered rocket-fuel for node.js**

![docs](/img/logo.png "docs")

We believe in sharing knowledge. So we have assembled this growing collection of node.js how-to articles. These articles range from basic to advanced. They provide relevant code samples and insights into the design and philosophy of node itself. 


docs.nodejitsu.com is an [open source project](http://github.com/nodejitsu/docs) and is curated by the [Nodejitsu](http:/www.nodejitsu.com) team and friends. If you have articles or ideas that you would like to contribute, we'd very much like to accept your pull request!

## Usage

### Read Articles, get good at Node.js

Browse /articles/ folder or [http://docs.nodejitsu.com](http://docs.nodejitsu.com)

### To generate the docs

    node bin/generate
    
### To start the docs server

    node bin/server


## Contribution Guide

*coming soon*

### To add an article:

- make a directory in `topics` for your article: `mkdir articles/how-to-make-an-article` (use only letters and dashes)
- next write your article: `vim articles/how-to-make-an-article/article.md`
- create a metadata with this data: `vim articles/how-to-make-an-article/metadata.json`

**metadata.json**

```javascript
{
  "title":"What is npm?",
  "date": "Fri Aug 26 2011 03:08:50 GMT-0700 (PST)",
  "tags": ["npm", "modules"],
  "author": "nico",
  "difficulty": 1
}
```


### Directory Structure

    topics/
        article-name/ //url version
            metadata.json
            article.md //file with the real article
            assets/
                ...
        ...

### Metadata Format

```javascript
{
  "title":"What is npm?",
  "date": "Fri Aug 26 2011 03:08:50 GMT-0700 (PST)",
  "tags": ["npm", "modules"],
  "author": "nico",
  "difficulty": 1
}
```
