## Godot Doc Generator

Generates plain html and html that's marked up for [Dash](https://kapeli.com/dash).

#### Table of Contents

1. [How to use](#how-to-use)
    1. [Setup](#setup)
    2. [Generating](#generating)
    3. [Styling](#styling)
    4. [Structuring](#structuring)
2. [Todo](#todo)

#### How to use

###### Setup

Run `npm install` at root of this project folder.

Install [nodejs](https://nodejs.org/en/) > v4.1.0 (required)

Install [Sass](http://sass-lang.com) (optional)

Install [Bourbon](http://bourbon.io) into the _resources/stylesheets_ folder (optional)

Install [Bourbon Neat](http://neat.bourbon.io/) into the _resources/stylesheets_ folder (optional)


###### Generating

Run `npm run <command>` at the root of this project folder.  
Command can be:
    - gen-docset
    - gen-html
    - gen-both
The docset and html will be in the folder _ouput_.

###### Styling

Frameworks used are [bourbon](http://bourbon.io) and [bourbon neat](http://neat.bourbon.io).

For styling you'll want to change _index.css_ in the _resources/stylesheets_ folder. Preprocess any css into that final index.css and then it will be copied on generation.


###### Structuring

[Handlebars](http://handlebarsjs.com) is used for templating.

For structure you can edit an existing template in the _resources/html/templates_ folder or add your own.

__NOTE__: Be sure to change the `TEMPLATE_PATH` variable in the file _gen.js_ to the template you want to use.

For each class in the docs a handlebar template's context is given a __Class__ object with an extra property called __everything__.
The __everything__ property is an object with the following fields:  

- classes - an array of all __Class__ s
- methods - an array of all __Method__ s
- signals - an array of all __Signal__ s
- members - an array of all __Member__ s
- constants - an array of all __Constant__ s

Take a look at _resources/javascript/gddoc-classes.js_ and see what properties these objects have.

Lastly, any handlebars helpers should be put in the file _resources/javascript/handlebar-helpers.js_. They will be loaded before generation.

#### Todo

- [DONE]Add dash doc table of contents  
- [DONE]Add anchors to other types  
- [DONE]add icon
- [DONE]Optionally show methods (or any other section) only if they exist
- []native type names such as 'real', 'int', 'float', etc. should do something other than 404
- []create index page and add "<key>dashIndexFilePath</key><string>index.html</string>" to Info.plist
