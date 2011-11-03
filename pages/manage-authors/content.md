Authors specified in the `page.json` are cross-referenced against `_id` parameters from files in the `/authors` folder. For instance, the value of "Nodejitsu" in the `author` field of a `page.json` will load the following data from `/authors/nodejitsu.json`:

**Sample Authors File**

    { "_id": "Nodejitsu",
      "name": "Nodejitsu",
      "email": "info@nodejitsu.com",
      "github": "nodejitsu",
      "twitter": "nodejitsu",
      "location": "Worldwide",
      "bio": "Nodejitsu is the creator of what is arguably the best Node.js platform as a service in existence."
    }

These properties are passed to your themes as an object assigned to `metadata.author`.
