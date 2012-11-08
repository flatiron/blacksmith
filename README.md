# blacksmith2

A reimplementation of blacksmith

## The specification

1. Blacksmith uses plates and marked
2. Blacksmith renders pages composed of sections, content, and metadata
3. Each page has a single layout
4. Each page may have multiple sections
5. Each page will have a single content section
6. Each section will be rendered from metadata
7. Metadata will be stored directly in markdown via citations

### Directory structure

/site
  .blacksmith
  /layouts
    default.html
    article.html 
  /sections
    sidebar.html
    breadcrumbs.html
  /pages
    index.json
    /articles
      an-article.md
      another-article.md
  