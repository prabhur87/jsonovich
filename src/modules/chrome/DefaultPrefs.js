/*
 * @license MPL 1.1/GPL 2.0/LGPL 2.1, see license.txt
 * @author William Elwood <we9@kent.ac.uk>
 * @copyright 2011 JSONovich Team. All Rights Reserved.
 * @description Module exporting default JSONovich preferences.
 */

'use strict';

var defaults = {
    'boolean': {
        'debug': false,            // user set to true enables debugging messages in console
        'acceptHeader.json': false // user set to true adds json mime to http accept header
    },
    'string-ascii': {
        'mime.conversions': [
            'application/json',                // standard, http://www.ietf.org/rfc/rfc4627.txt
            'application/sparql-results+json', // standard, http://www.w3.org/TR/rdf-sparql-json-res/
            'application/schema+json',         // draft, http://json-schema.org/
            'application/jsonrequest',         // proposed, http://json.org/JSONRequest.html
            'application/json-p',              // proposed, http://www.json-p.org/
            'text/json-p',                     // proposed, http://www.json-p.org/
            'application/x-json',              // legacy, officially application/json
            'text/json',                       // legacy, officially application/json
            'text/x-json',                     // legacy, officially application/json
            'application/rdf+json',            // legacy, officially application/json
            'application/jsonml+json',         // unofficial, http://jsonml.org/
            'application/javascript',          // standard, http://www.ietf.org/rfc/rfc4329.txt
            'application/ecmascript',          // standard, http://www.ietf.org/rfc/rfc4329.txt
            'text/javascript',                 // obsolete, http://www.ietf.org/rfc/rfc4329.txt
            'text/ecmascript',                 // obsolete, http://www.ietf.org/rfc/rfc4329.txt
            'application/x-javascript',        // legacy, officially application/javascript
            'application/x-ecmascript',        // legacy, officially application/ecmascript
            'text/x-javascript',               // legacy, officially application/javascript
            'text/x-ecmascript'                // legacy, officially application/ecmascript
        ].join('|'),

        'mime.extensionMap': [
            'json:application/json',
            'srj:application/sparql-results+json'
        ].join('|'),

        'acceptHeaderOverride.json.bbc.co.uk': '0',
        'acceptHeaderOverride.json.www.bbc.co.uk': '0'
    }
};

/**
 * Dynamically sets default preferences
 *
 * @param setDefaultPref <function>  Reference to the set function for the appropriate default
 *                                   preferences branch, require('prefs').branch(<branch>, true).set
 */
exports.set = function setDefaults(setDefaultPref) {
    for(let type in defaults) {
        for(let pref in defaults[type]) {
            setDefaultPref(pref, type, defaults[type][pref]);
        }
    }
};
