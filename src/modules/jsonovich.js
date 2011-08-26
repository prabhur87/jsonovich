/**
 * @license MPL 1.1/GPL 2.0/LGPL 2.1, see license.txt
 * @author William Elwood <we9@kent.ac.uk>
 * @copyright 2011 JSONovich Team. All Rights Reserved.
 * @description __________.
 *
 * Changelog:
 * [2011-08] - Created __________
 */

'use strict';

function startup() {
    TS['PrepareAsyncLoad'] = [Date.now()];
    let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    timer.init({ // async load
        observe: function() {
            let prefs = require('prefs').branch,
            listenPref = prefs('extensions.' + ADDON_LNAME).listen;
            listenPref('debug', function(branch, pref) {
                let debug = branch.get(pref, 'boolean');
                let log = require('log');
                log.setDebug(debug);
                if(debug) {
                    let desc = {
                        'Bootstrap': 'time taken to execute bootstrap script',
                        'E10SBootstrap': 'time taken to execute content process bootstrap script',
                        'Startup': 'time between us receiving startup event and leaving event listener during browser startup',
                        'Install': 'time between us receiving startup event and leaving event listener during user-initiated install',
                        'Restart': 'time between us receiving startup event and leaving event listener after user-initiated enable',
                        'StartRequest': 'time spent in the most recent call to the stream converter\'s onStartRequest function',
                        'DataAvailable': 'time spent in the most recent call to the stream converter\'s onDataAvailable function',
                        'ParseJSON': 'time spent parsing the received JSON string into an object',
                        'FormatJSON': 'time spent tokenising the parsed object and generating a string of HTML',
                        'StopRequest': 'time spent in the most recent call to the stream converter\'s onStopRequest function',
                        'SetDefaultPrefs': 'time spent initialising default preferences',
                        'RegisterConversions': 'time taken to register stream converters',
                        'RegisterExtMap': 'time taken to register file extension to type mappings',
                        'RegisterAcceptHeader': 'time taken to set up Accept header',
                        'RegisterResAlias': 'time taken to register resource:// URL alias',
                        'ObserveOptionsUI': 'time taken to add options UI observer',
                        'PrepareAsyncLoad': 'time spent initialising nsiTimer to defer loading non-essentials'
                    };
                    for(let measure in TS) {
                        if(TS[measure].length>1) {
                            log.info(measure + ' Performance: ' + (TS[measure][1]-TS[measure][0]) + 'ms' + (measure in desc ? ' (' + desc[measure] + ')' : ''));
                        }
                    }
                }
            });
            timer = null; // "Users of instances of nsITimer should keep a reference to the timer until it is no longer needed in order to assure the timer is fired."
        }
    }, 500, timer.TYPE_ONE_SHOT);
    TS['PrepareAsyncLoad'].push(Date.now());
}

function shutdown() {
    require('unload').unload();
}
