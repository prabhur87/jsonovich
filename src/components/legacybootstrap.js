/**
 * @license MPL 1.1/GPL 2.0/LGPL 2.1, see license.txt
 * @author William Elwood <we9@kent.ac.uk>
 * @copyright 2011 JSONovich Team. All Rights Reserved.
 * @copyright Portions (C) 2009, 2010 the Mozilla Foundation.
 * @description This file contains the JSONovich bootstrap for older Gecko browsers.
 * @todo When dropping Gecko 1.9.1/Firefox 3.5 support, remove emulation of XPCOMUtils lazy getters.
 * @todo When dropping Gecko 1.9.2/Firefox 3.6 support, all this code becomes unnecessary.
 */

const ADDON_NAME = 'JSONovich';
const ADDON_LNAME = 'jsonovich';
const ADDON_DOMAIN = 'lackoftalent.org';
const IN_CHROME = true;
const IN_CONTENT = true; // no process separation or message manager
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cm = Components.manager;
const Cr = Components.results;
const Cu = Components.utils;

var TS = {
    'Bootstrap': [Date.now()]
};
var electrolyte = null;
var getResourceURI = null;

Cu['import']("resource://gre/modules/XPCOMUtils.jsm");

function getResourceURISpec(path) {
    return getResourceURI(path).spec;
}

if(!XPCOMUtils.defineLazyGetter) { // emulate XPCOMUtils.defineLazyGetter (introduced in Gecko 1.9.2/FF3.6)
    // @see http://hg.mozilla.org/mozilla-central/diff/f2ebd467b1cd/js/src/xpconnect/loader/XPCOMUtils.jsm
    XPCOMUtils.defineLazyGetter = function XPCU_defineLazyGetter(aObject, aName, aLambda) {
        aObject.__defineGetter__(aName, function() {
            delete aObject[aName];
            return aObject[aName] = aLambda.apply(aObject);
        });
    }
}
if(!XPCOMUtils.defineLazyServiceGetter) { // emulate XPCOMUtils.defineLazyServiceGetter (introduced in Gecko 1.9.2/FF3.6)
    // @see http://hg.mozilla.org/mozilla-central/diff/acb4f43ba5ab/js/src/xpconnect/loader/XPCOMUtils.jsm
    XPCOMUtils.defineLazyServiceGetter = function XPCU_defineLazyServiceGetter(aObject, aName, aContract, aInterfaceName) {
        XPCOMUtils.defineLazyGetter(aObject, aName, function XPCU_serviceLambda() {
            return Cc[aContract].getService(Ci[aInterfaceName]);
        });
    }
}
let Services = {}; // emulate Services.jsm (introduced in Gecko 2/FF4)
// @see http://hg.mozilla.org/mozilla-central/diff/78e5543c0bc4/toolkit/content/Services.jsm
XPCOMUtils.defineLazyGetter(Services, "prefs", function () {
    return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).QueryInterface(Ci.nsIPrefBranch2);
});
XPCOMUtils.defineLazyServiceGetter(Services, "obs", "@mozilla.org/observer-service;1", "nsIObserverService");
XPCOMUtils.defineLazyServiceGetter(Services, "io", "@mozilla.org/network/io-service;1", "nsIIOService2");
// @see http://hg.mozilla.org/mozilla-central/diff/365acfca64dc/toolkit/content/Services.jsm
XPCOMUtils.defineLazyGetter(Services, "appinfo", function () {
    return Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo).QueryInterface(Ci.nsIXULRuntime);
});
XPCOMUtils.defineLazyServiceGetter(Services, "vc", "@mozilla.org/xpcom/version-comparator;1", "nsIVersionComparator");
XPCOMUtils.defineLazyServiceGetter(Services, "scriptloader", "@mozilla.org/moz/jssubscript-loader;1", "mozIJSSubScriptLoader");
// @see http://hg.mozilla.org/mozilla-central/diff/b264a7e3c0f5/toolkit/content/Services.jsm
XPCOMUtils.defineLazyServiceGetter(Services, "console", "@mozilla.org/consoleservice;1", "nsIConsoleService");

// emulate Array.isArray (introduced in JavaScript 1.8.5 with Gecko 2/FF4)
//@see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if(!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) == '[object Array]';
    };
}

function startup() {
    electrolyte = {};
    Services.scriptloader.loadSubScript(getResourceURISpec('modules/electrolyte.js'), electrolyte);
    if(electrolyte.startup) {
        var once = {};
        Cu['import'](getResourceURISpec('modules/content/OncePerProcess.jsm'), once);
        electrolyte.startup(once);
    }
}

function uninstall() {
    if(electrolyte.uninstall) {
        electrolyte.uninstall();
    }
    shutdown();
}

function shutdown() { // thanks to work on restartless support, we can do this on-demand in legacy Gecko :D
    if(electrolyte.shutdown) {
        electrolyte.shutdown();
    }
    electrolyte = null;
}

function JSONovichBootstrap() {}
JSONovichBootstrap.prototype = {
    classDescription: ADDON_NAME,
    classID:          Components.ID("{dcc31be0-c861-11dd-ad8b-0800200c9a65}"),
    contractID:       '@' + ADDON_DOMAIN + '/' + ADDON_LNAME + 'bootstrap;1',
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),
    _xpcom_categories: [{
        category: "profile-after-change"
    }],

    observe: function(aSubject, aTopic, aData) {
        switch(aTopic) {
            case "profile-after-change": // startup
                TS['Startup'] = [Date.now()];
                startup();
                Services.obs.addObserver(this, "em-action-requested", false);
                TS['Startup'].push(Date.now());
                break;
            case "em-action-requested":
                aSubject.QueryInterface(Ci.nsIUpdateItem);
                if(aSubject.id == ADDON_LNAME + '@' + ADDON_DOMAIN) {
                    switch(aData) {
                        case "item-uninstalled": // uninstall
                            uninstall();
                            break;
                        case "item-disabled": // disable
                            shutdown();
                            break;
                        case "item-cancel-action": // re-enable / re-install
                            TS['Restart'] = [Date.now()];
                            startup();
                            TS['Restart'].push(Date.now());
                            break;
                    }
                }
                break;
        }
    }
};

function NSGetModule(compMgr, fileSpec) { // legacy Gecko entrypoint
    let rootPath = fileSpec.parent.parent;

    // emulate more Gecko 2, based mostly on buildJarURI and AddonWrapper.getResourceURI
    getResourceURI = function getResourceURI(aPath) { // @see http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/extensions/XPIProvider.jsm
        let doJar = false, bundle = rootPath.clone();
        if(aPath) {
            if(bundle.isDirectory()) {
                aPath.split("/").forEach(function(aPart) {
                    bundle.append(aPart);
                });
            } else {
                doJar = true;
            }
        }
        bundle = Services.io.newFileURI(bundle);
        if(doJar) {
            return Services.io.newURI("jar:" + bundle.spec + "!/" + aPath, null, null);
        }
        return bundle;
    }

    let module = XPCOMUtils.generateModule([JSONovichBootstrap]);
    TS['Bootstrap'].push(Date.now());
    return module;
}
