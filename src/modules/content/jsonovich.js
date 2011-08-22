/**
 * @license MPL 1.1/GPL 2.0/LGPL 2.1, see license.txt
 * @author William Elwood <we9@kent.ac.uk>
 * @copyright 2011 JSONovich Team. All Rights Reserved.
 * @description This file contains lifecycle functions specific to content processes.
 *
 * Changelog:
 * [2011-07] - Separated content-related lifecycle functions for Electrolysis
 */

'use strict';

function startup() {
    function init() {
        let prefs = require('prefs').branch,
        listenPref = prefs('extensions.' + ADDON_LNAME).listen;

        //TS['RegisterConversions'] = [Date.now()];
        require('content/StreamConverter').register(listenPref);
    //TS['RegisterConversions'].push(Date.now());
    }

    if(typeof once == 'undefined') {
        init();
    } else {
        once.runOnce('init', init);
    }

// TODO: listen for document load event, prettify json
/*addEventListener("DOMContentLoaded", function() {
}, false);*/
}

function shutdown() {
    require('unload').unload();
}
