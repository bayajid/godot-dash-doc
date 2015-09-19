var genType = process.argv[2] || 'docset';

var fs = require('fs');
var path = require('path');
var sqlite3 = require('sqlite3');
var Handlebars = require('handlebars');
var gddocloader = require('./resources/javascript/gddoc-loader.js');
require('./resources/javascript/handlebar-helpers.js')(Handlebars);


const DOCSET_PATH       = path.normalize('output/Godot.docset');
const DOCSET_CONTENTS   = path.join(DOCSET_PATH, 'Contents');
const DOCSET_RESOURCES  = path.join(DOCSET_CONTENTS, 'Resources');
const DOCSET_DOCUMENTS  = path.join(DOCSET_RESOURCES, 'Documents');
const DOCSET_DATABASE   = path.join(DOCSET_RESOURCES, 'docSet.dsidx');
const DOCSET_CSS_PATH   = path.join(DOCSET_RESOURCES, 'index.css');
const DOCSET_PLIST_PATH = path.join(DOCSET_CONTENTS, 'Info.plist');
const DOCSET_ICON_PATH  = path.join(DOCSET_PATH, 'icon.png');

const RES_PATH          = path.normalize('resources');
const HTML_PATH         = path.join(RES_PATH, 'html');
const TEMPLATES_PATH    = path.join(HTML_PATH, 'templates');
const GDDOCS_PATH       = path.join(RES_PATH, 'gddocs');
const PLIST_PATH        = path.join(RES_PATH, 'docset_info.plist');
const ICON_PATH         = path.join(RES_PATH, 'docset_icon.png');

/******* CHANGE ME! :D ******/
const TEMPLATE_PATH     = path.join(TEMPLATES_PATH, 'class.html');
const GDDOC_PATH        = path.join(GDDOCS_PATH, 'classes.xml');
/***************************/

const STYLESHEETS_PATH  = path.normalize('resources/stylesheets');
const SCSS_PATH         = path.join(STYLESHEETS_PATH, 'index.scss');
const CSS_PATH          = path.join(STYLESHEETS_PATH, 'index.css');

var gddoc = gddocloader.loadData(GDDOC_PATH);
var isIndexing = false;

//These are for gauging how much has been indexed in the bd.
// cc == completed classes
// cm == completed methods
// etc.
var cc = 0, cm = 0, cco = 0, cme = 0, cs = 0;

function mkdir(dir) {
    console.log('Making/Checking for directories', dir + '...');
    var split = dir.split('/');
    var sum = '';
    for(var s of split) {
        sum = path.join(sum, s);
        try {
            fs.mkdirSync(sum);
        } catch(e) {
            if(e.code !== 'EEXIST') throw e;
        }
    }
}

function generateDocsetStructure() {
    mkdir(DOCSET_DOCUMENTS);

    console.log('Generating docset structure...');

    fs.createReadStream(PLIST_PATH).pipe(fs.createWriteStream(DOCSET_PLIST_PATH));
    fs.createReadStream(ICON_PATH).pipe(fs.createWriteStream(DOCSET_ICON_PATH));
}

function indexDocsetHTML() {
    console.log('Indexing docset...');
    isIndexing = true;

    var db = new sqlite3.Database(DOCSET_DATABASE);
    db.serialize(() => {
        db.run('DROP TABLE IF EXISTS searchIndex;');
        db.run('CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT);');
        db.run('CREATE UNIQUE INDEX IF NOT EXISTS anchor ON searchIndex (name, type, path);');

        var stm = db.prepare('INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES (?, ?, ?);');

        gddoc.classes.forEach(class_ => {
            var fname = class_.name + '.html';
            stm.run(class_.name, 'Class', fname, () => {cc++});

            // Comment these out if just indexing of classes is desired
            class_.methods.forEach(method => {
                var anchor = `#//apple_ref/cpp/Method/${method.name}`;
                stm.run(method.name, 'Method', fname + anchor, () => {cm++});
            });

            class_.constants.forEach(constant => {
                var anchor = `#//apple_ref/cpp/Constant/${constant.name}`;
                stm.run(constant.name, 'Constant', fname, () => {cco++});
            });

            class_.members.forEach(member => {
                var anchor = `#//apple_ref/cpp/Variable/${member.name}`;
                stm.run(member.name, 'Variable', fname, () => {cme++});
            });

            class_.signals.forEach(signal => {
                var anchor = `#//apple_ref/cpp/Event/${signal.name}`;
                stm.run(signal.name, 'Event', fname, () => {cs++});
            });
        });

        stm.finalize();
    });

    db.close(err => {
        isIndexing = false;
        if(err) console.log('Error while indexing: ', err);
    });
}

function generateHTML(outputPath) {
    console.log('Generating HTML to', outputPath + '...');

    var template = Handlebars.compile( fs.readFileSync(TEMPLATE_PATH, 'utf8') );
    gddoc.classes.forEach(class_ => {
        var fname = path.join(outputPath, class_.name + '.html');
        class_.everything = gddoc;
        var html = template(class_);
        fs.writeFileSync(fname, html);
    });
}

function generateCSS(outputFile) {
    console.log('Generating CSS to', outputFile + '...');
    fs.createReadStream(CSS_PATH).pipe(fs.createWriteStream(outputFile));
}

if(genType === 'both' || genType === 'docset') {
    console.log('\n~~ Generating Docset ~~')
    generateDocsetStructure();
    generateHTML(DOCSET_DOCUMENTS);
    generateCSS(DOCSET_CSS_PATH);
    indexDocsetHTML();
    console.log();
}

if(genType === 'both' || genType === 'html') {
    console.log('\n~~ Generating HTML ~~');
    mkdir('output/gen_html/html');
    generateHTML('output/gen_html/html');
    generateCSS('output/gen_html/index.css');
    console.log();
}

if(!isIndexing) return console.log('Done.');
var iid = setInterval(() => {
    if(!isIndexing) {
         clearInterval(iid);
         console.log('Done.');
    } else console.log(`still idxing... Class: ${cc}/${gddoc.classes.length}, Method: ${cm}/${gddoc.methods.length}, Constant: ${cco}/${gddoc.constants.length}, Member: ${cme}/${gddoc.members.length}, Signal: ${cs}/${gddoc.signals.length}`);
}, 5000);
