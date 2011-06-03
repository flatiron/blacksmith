All npm package have a little file called `package.json` which holds metadata relevant to the project. This little file gives information to npm allowing it to handle the package's dependencies. It also contains other metadata such as its name, description, versions, license and configuration values which is useful to both npm and the user of the package. The package.json file is normally located at the root directory of a node.js project.

Now as an example of probably the most barebones package.json possible:

    {
      "name" : "barebones",
      "version" : "0.0.0",
    }

The `name` field intuitively means the name of your project. The `version` field is used by npm to make sure the right version of the package is being installed. Generally, it takes the form of `major.minor.patch` where `major`, `minor`, and `patch` are integers which increase after each new release. For more details, look at this spec: http://semver.org.

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

As you can see, there are fields for the `description` and `keywords` of your projects. This allows people who find your project understand what it is in a few a few words. The fields `author`, `contributors`, `homepage` and `repository` all can used to reference who wrote the files, show how to contact the author, and gives links for additional references. The file listed in the `main` field is the file that exports the libary. So when someone runs `require(<library name>)`, require resolves this call to `require(<package.json:main>)`. Finally the `dependencies` field is used to list all the dependencies of your project. When someone installs your project through npm, all the dependencies listed will be installed as well. Also if someone runs `npm install` in the root directory of your project, it will install all the dependencies to `./node_modules`.

For even more options, you can look through <https://github.com/isaacs/npm/blob/master/doc/json.md> or run `npm help json`
