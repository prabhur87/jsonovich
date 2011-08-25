/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is JSONovich content script.
 *
 * The Initial Developer of the Original Code is
 * William Elwood <we9@kent.ac.uk>.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK *****
 *
 * This file contains block-folding functions for the rendered JSON content.
 */

'use strict';

document.addEventListener("DOMContentLoaded", function() {
  var r_folded = / folded\b/, r_toggled = / toggled\b/;
  Array.prototype.map.call(document.querySelectorAll(".json [data-fold]"), makeFoldable);

  function makeFoldable(fold) {
    fold.className += " foldable";
    fold.addEventListener("click", toggleFold, false);
  }

  function toggleFold() {
    var fold = this.getAttribute("data-fold"),
    folded = this.hasAttribute("data-folded"),
    foldLines = this.parentNode.querySelectorAll("[data-fold" + fold + "]")/*,
    foldStart = this.querySelector("code")*/;
    toggle(this, "toggled", r_toggled);
    Array.prototype.map.call(foldLines, helper);
    if(folded) {
      this.removeAttribute("data-folded");/*
      foldStart.removeChild(foldStart.lastChild);*/
    } else {
      this.setAttribute("data-folded", "1");/*
      var end = document.createTextNode(" \2026 " + foldLines.item(foldLines.length-1).textContent.trim());
      foldStart.appendChild(end);*/
    }

    function helper(line) {
      toggle(line, "folded", r_folded);
    }

    function toggle(element, style, regex) {
      if(folded) {
        element.className = element.className.replace(regex, "");
      } else {
        element.className += " " + style;
      }
    }
  }
}, false);