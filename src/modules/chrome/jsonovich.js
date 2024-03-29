/**
 * @license MPL 1.1/GPL 2.0/LGPL 2.1, see license.txt
 * @author William Elwood <we9@kent.ac.uk>
 * @copyright 2011 JSONovich Team. All Rights Reserved.
 * @description This file contains lifecycle functions specific to chrome processes.
 */

'use strict';

function startup(once) {
    var prefs = require('prefs').branch,
    prefBranch = prefs(ADDON_PREFROOT),
    listenPref = prefBranch.listen;

    TS['SetDefaultPrefs'] = [Date.now()];
    require('chrome/DefaultPrefs').set(prefs(ADDON_PREFROOT, true).set);
    TS['SetDefaultPrefs'].push(Date.now());

    TS['RegisterExtMap'] = [Date.now()];
    require('chrome/ExtToTypeMapping').register(listenPref);
    TS['RegisterExtMap'].push(Date.now());

    TS['RegisterAcceptHeader'] = [Date.now()];
    require('chrome/AcceptHeader').register('json', listenPref);
    TS['RegisterAcceptHeader'].push(Date.now());

    TS['RegisterResAlias'] = [Date.now()];
    require('chrome/ResourceAlias').register(ADDON_LNAME, getResourceURI('resources/')); // trailing slash required inside XPI
    TS['RegisterResAlias'].push(Date.now());

    TS['RegisterReqObserver'] = [Date.now()];
    require('chrome/RequestObserver').register(once, 'json');
    TS['RegisterReqObserver'].push(Date.now());

    if(Services.vc.compare(Services.appinfo.platformVersion, '6.9') > 0) { // inline options UI only available in Gecko7+
        TS['ObserveOptionsUI'] = [Date.now()];
        require('chrome/Options').observe(prefBranch);
        TS['ObserveOptionsUI'].push(Date.now());
    }
}

function uninstall() {
    require('chrome/Options').clear();
}
