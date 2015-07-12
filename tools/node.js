var path = require("path");
var fs = require("fs");
var vm = require("vm");

var Emojify = vm.createContext({
    console       : console,
    process       : process,
    Buffer        : Buffer,
    MOZ_SourceMap : require("source-map")
});

function load_global(file) {
    file = path.resolve(path.dirname(module.filename), file);
    try {
        var code = fs.readFileSync(file, "utf8");
        return vm.runInContext(code, Emojify, file);
    } catch(ex) {
        // XXX: in case of a syntax error, the message is kinda
        // useless. (no location information).
        console.log("ERROR in file: " + file + " / " + ex);
        process.exit(1);
    }
};

var FILES = exports.FILES = [
    "../lib/string-polyfill.js",
    "../lib/manglers.js",
    "../lib/utils.js",
    "../lib/ast.js",
    "../lib/parse.js",
    "../lib/transform.js",
    "../lib/scope.js",
    "../lib/output.js",
    "../lib/compress.js",
    "../lib/sourcemap.js",
    "../lib/mozilla-ast.js",
    "../lib/propmangle.js"
].map(function(file){
    return fs.realpathSync(path.join(path.dirname(__filename), file));
});

FILES.forEach(load_global);

Emojify.AST_Node.warn_function = function(txt) {
    console.error("WARN: %s", txt);
};

// XXX: perhaps we shouldn't export everything but heck, I'm lazy.
for (var i in Emojify) {
    if (Emojify.hasOwnProperty(i)) {
        exports[i] = Emojify[i];
    }
}

exports.minify = function(files, options) {
    options = Emojify.defaults(options, {
        spidermonkey : false,
        outSourceMap : null,
        sourceRoot   : null,
        inSourceMap  : null,
        fromString   : false,
        warnings     : false,
        mangle       : {},
        output       : null,
        compress     : {}
    });
    Emojify.base54.reset();

    // 1. parse
    var toplevel = null,
        sourcesContent = {};

    if (options.spidermonkey) {
        toplevel = Emojify.AST_Node.from_mozilla_ast(files);
    } else {
        if (typeof files == "string")
            files = [ files ];
        files.forEach(function(file){
            var code = options.fromString
                ? file
                : fs.readFileSync(file, "utf8");
            sourcesContent[file] = code;
            toplevel = Emojify.parse(code, {
                filename: options.fromString ? "?" : file,
                toplevel: toplevel
            });
        });
    }

    // 2. compress
    if (options.compress) {
        var compress = { warnings: options.warnings };
        Emojify.merge(compress, options.compress);
        toplevel.figure_out_scope();
        var sq = Emojify.Compressor(compress);
        toplevel = toplevel.transform(sq);
    }

    // 3. mangle
    if (options.mangle) {
        toplevel.figure_out_scope(options.mangle);
        toplevel.compute_char_frequency(options.mangle);
        toplevel.mangle_names(options.mangle);
    }

    // 4. output
    var inMap = options.inSourceMap;
    var output = {};
    if (typeof options.inSourceMap == "string") {
        inMap = fs.readFileSync(options.inSourceMap, "utf8");
    }
    if (options.outSourceMap) {
        output.source_map = Emojify.SourceMap({
            file: options.outSourceMap,
            orig: inMap,
            root: options.sourceRoot
        });
        if (options.sourceMapIncludeSources) {
            for (var file in sourcesContent) {
                if (sourcesContent.hasOwnProperty(file)) {
                    output.source_map.get().setSourceContent(file, sourcesContent[file]);
                }
            }
        }

    }
    if (options.output) {
        Emojify.merge(output, options.output);
    }
    var stream = Emojify.OutputStream(output);
    toplevel.print(stream);

    if(options.outSourceMap){
        stream += "\n//# sourceMappingURL=" + options.outSourceMap;
    }

    var source_map = output.source_map;
    if (source_map) {
        source_map = source_map + "";
    }

    return {
        code : stream + "",
        map  : source_map
    };
};

exports.describe_ast = function() {
    var out = Emojify.OutputStream({ beautify: true });
    function doitem(ctor) {
        out.print("AST_" + ctor.TYPE);
        var props = ctor.SELF_PROPS.filter(function(prop){
            return !/^\$/.test(prop);
        });
        if (props.length > 0) {
            out.space();
            out.with_parens(function(){
                props.forEach(function(prop, i){
                    if (i) out.space();
                    out.print(prop);
                });
            });
        }
        if (ctor.documentation) {
            out.space();
            out.print_string(ctor.documentation);
        }
        if (ctor.SUBCLASSES.length > 0) {
            out.space();
            out.with_block(function(){
                ctor.SUBCLASSES.forEach(function(ctor, i){
                    out.indent();
                    doitem(ctor);
                    out.newline();
                });
            });
        }
    };
    doitem(Emojify.AST_Node);
    return out + "";
};

function readReservedFile(filename, reserved) {
    if (!reserved) {
        reserved = { vars: [], props: [] };
    }
    var data = fs.readFileSync(filename, "utf8");
    data = JSON.parse(data);
    if (data.vars) {
        data.vars.forEach(function(name){
            Emojify.push_uniq(reserved.vars, name);
        });
    }
    if (data.props) {
        data.props.forEach(function(name){
            Emojify.push_uniq(reserved.props, name);
        });
    }
    return reserved;
}

exports.readReservedFile = readReservedFile;

exports.readDefaultReservedFile = function(reserved) {
    return readReservedFile(path.join(__dirname, "domprops.json"), reserved);
};

exports.readNameCache = function(filename, key) {
    var cache = null;
    if (filename) {
        try {
            var cache = fs.readFileSync(filename, "utf8");
            cache = JSON.parse(cache)[key];
            if (!cache) throw "init";
            cache.props = Emojify.Dictionary.fromObject(cache.props);
        } catch(ex) {
            cache = {
                cname: -1,
                props: new Emojify.Dictionary()
            };
        }
    }
    return cache;
};

exports.writeNameCache = function(filename, key, cache) {
    if (filename) {
        var data;
        try {
            data = fs.readFileSync(filename, "utf8");
            data = JSON.parse(data);
        } catch(ex) {
            data = {};
        }
        data[key] = {
            cname: cache.cname,
            props: cache.props.toObject()
        };
        fs.writeFileSync(filename, JSON.stringify(data, null, 2), "utf8");
    }
};
