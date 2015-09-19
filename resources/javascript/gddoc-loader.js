/**
 * Load godot xml documentation at path and return js objects representing
 * the doc data. The objects representing the xml can be found in file gdoc-classes.js
 * @param  {str} path path to godot xml documentation
 * @return {obj}      an object with 5 fields holding arrays:
 *                       classes, methods, constants, members, signals.
 *                    Each field is an array of all those ^ parts from the
 *                    docs given.
 */
module.exports.loadData = function(docPath) {
    "use strict";

    var cheerio = require('cheerio')
    var fs      = require('fs')
    var path    = require('path');
    /*LoadGlbls*/ require('./gddoc-classes.js');

    var fileContents = fs.readFileSync(path.normalize(docPath));
    var $ = cheerio.load(fileContents,
        {
            normalizeWhitespace: true,
            xmlMode: true
        }
    );


    // A set of arrays that will contain all data.
    // This can be used to index pages, inheritance trees,
    // and other stuff like that.
    var classObjs    = [];
    var methodObjs   = [];
    var constantObjs = [];
    var memberObjs   = [];
    var signalObjs   = [];


    var $classes = $('class');
    $classes.each(function(i, e) {
        // Cheerio Objects of Class Elements
        var $e         = $(e);
        var $methods   = $('methods', $e);
        var $constants = $('constants', $e);
        var $members   = $('members', $e);
        var $signals   = $('signals', $e);

        // Class Attributes
        var category = $e.attr('category');
        var inherits = $e.attr('inherits');
        var name     = $e.attr('name');
        var briefDes = $e.children('brief_description').text();
        var fullDes  = $e.children('description').text();
        var classObj = new Class(category, inherits, name, briefDes, fullDes);

        $methods.find('method').each((i, method) => {
            var $method  = $(method);
            var $returns = $method.find('return');

            var returnType     = $returns.attr('type');
            var returnTypeDesc = $returns.text();

            var name          = $method.attr('name');
            var argObjs       = getArgs($method);
            var returnTypeObj = new ReturnType(returnType, returnTypeDesc);
            var descrip       = $method.find('description').text();

            var methodObj = new Method(name, argObjs, returnTypeObj, new Description(null, descrip));
            classObj.methods.push(methodObj);
        });

        $constants.find('constant').each((i, constant) => {
            var $constant = $(constant);
            var name      = $constant.attr('name');
            var value     = $constant.attr('value');
            var descrip   = $constant.text();

            var constantObj = new Constant(name, value, new Description(null, descrip));
            classObj.constants.push(constantObj);
        });

        $members.find('member').each((i, member) => {
            var $member = $(member);
            var name    = $member.attr('name');
            var type    = $member.attr('type');
            var descrip = $member.text();

            var memberObj = new Member(name, type, new Description(null, descrip));
            classObj.members.push(memberObj);
        });

        $signals.find('signal').each((i, signal) => {
            var $signal = $(signal);
            var name    = $signal.attr('name');
            var args    = getArgs($signal);
            var descrip = $signal.text();

            var signalObj = new Signal(name, args, new Description(null, descrip));
            classObj.signals.push(signalObj);
        });

        // push all objs to their corresponding arrays to be created into index pages
        // inheritance trees, whatever.
        classObj.methods.forEach  (e => { methodObjs.push(e);   });
        classObj.constants.forEach(e => { constantObjs.push(e); });
        classObj.members.forEach  (e => { memberObjs.push(e);   });
        classObj.signals.forEach  (e => { signalObjs.push(e);  });
        classObjs.push(classObj);
    });



    //// Helper Functions

    // For use with a $method and a $signal, they both can contain
    // children that are <argument>s
    // Returns an array of Argument objects
    function getArgs($withArgChild) {
        var args = [];
        $withArgChild.find('argument').each((i, e) => {
            let $arg = $(e);
            var idx = $arg.attr('index');
            var name = $arg.attr('name');
            var type = $arg.attr('type');
            var descrip = $arg.text();
            var arg = new Argument(idx, name, type, descrip);
            args.push(arg);
        });
        return args;
    }


    return {
        classes: classObjs,
        methods: methodObjs,
        constants: constantObjs,
        members: memberObjs,
        signals: signalObjs
    }
};
