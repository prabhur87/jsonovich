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

function startup(once) {
    require('unload'); // workaround to avoid race condition in content scripts at shutdown where the getResourceURISpec listener in the parent has been removed

    function init() {
        let prefs = require('prefs').branch,
        listenPref = prefs('extensions.' + ADDON_LNAME).listen;

        //TS['RegisterConversions'] = [Date.now()];
        require('content/StreamConverter').register(listenPref);
    //TS['RegisterConversions'].push(Date.now());
    }

    if(once) {
        once.runOnce('init', init);
    } else {
        init();
    }

// TODO: listen for document load event, prettify json
/*addEventListener("DOMContentLoaded", function() {
}, false);*/
}

function shutdown() {
    require('unload').unload();
}
