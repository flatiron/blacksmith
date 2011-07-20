All npm packages contain a file, usually in the project root, called `package.json` - this file holds various metadata relevant to the project.  This file is used to give information to `npm` that allows it to identify the project as well as handle the project's dependencies. It can also contain other metadata such as a project description, the version of the project in a particular distribution, license information, even configuration data - all of which can be vital to both `npm` and to the end users of the package. The `package.json` file is normally located at the root directory of a Node.js project.

Node itself is only aware of two fields in the `package.json`:

    {
      "name" : "barebones",
      "version" : "0.0.0",
    }

The `name` field should explain itself: this is the name of your project. The `version` field is used by npm to make sure the right version of the package is being installed. Generally, it takes the form of `major.minor.patch` where `major`, `minor`, and `patch` are integers which increase after each new release. For more details, look at this spec: http://semver.org.

For a more complete package.json, we can check out `underscore`:

    {
      "name" : "underscore",
      "description" : "JavaScript's functional programming helper library.",
      "homepage" : "http://documentcloud.github.com/underscore/",
      "keywords" : ["util", "functional", "server", "client", "browser"],
      "author" : "Jeremy Ashkenas <jeremy@documentcloud.org>",
      "contributors" : [],
      "dependencies" : [],
      "repository" : {"type": "git", "url": "git://github.com/documentcloud/underscore.git"},
      "main" : "underscore.js",
      "version" : "1.1.6"
    }

As you can see, there are fields for the `description` and `keywords` of your projects. This allows people who find your project understand what it is in just a few words. The `author`, `contributors`, `homepage` and `repository` fields can all be used to credit the people who contributed to the project, show how to contact the author/maintainer, and give links for additional references. 

The file listed in the `main` field is the main entry point for the libary; when someone runs `require(<library name>)`, require resolves this call to `require(<package.json:main>)`. 

Finally, the `dependencies` field is used to list all the dependencies of your project that are available on `npm`. When someone installs your project through `npm`, all the dependencies listed will be installed as well.  Additionally, if someone runs `npm install` in the root directory of your project, it will install all the dependencies to `./node_modules`.

For even more options, you can look through <https://github.com/isaacs/npm/blob/master/doc/json.md> or run `npm help json`
