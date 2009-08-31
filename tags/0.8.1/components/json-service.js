/*
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is the wmlbrowser extension.
 *
 * The Initial Developer of the Original Code is Matthew Wilson
 * <matthew@mjwilson.demon.co.uk>. Portions created by the Initial Developer
 * are Copyright (C) 2004 the Initial Developer. All Rights Reserved.
 *
 * The Original Code has been modified to support XHTML mobile profile.
 * The modified code is Copyright (C) 2006 Gareth Hunt.
 *
 * The modified code has been further modified to support application/json
 * pretty printing
 * The further modified code is Copyright (C) 2008 Michael J. Giarlo.
 *
 * This file contains the content handler for converting content of types
 * application/json and text/x-json (JSONStreamConverter)
 */

/* application/json & text/x-json -> text/html stream converter */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cr = Components.results;
const Cu = Components.utils;

function JSONStreamConverter() {
  this.wrappedJSObject = this;
}

JSONStreamConverter.prototype = {
  _logger: null,
  _initialized: false,

  init: function () {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this._logger = Cc["@mozilla.org/consoleservice;1"]
                    .getService(Ci.nsIConsoleService);
    this._logger.logStringMessage("JSONStreamConverter initialized");

    if (typeof(JSON) === "undefined") {
      // JSON.parse and JSON.stringify are included in Firefox 3.1
      try {
        Cu.import("resource://jsonovich/json2.js");
      }
      catch(e) {
        Cu.reportError(e);
        throw "Could not find JSON module";
      }
    }
    this.JSON = JSON;
  },

  QueryInterface: function (aIid) {
    if (aIid.equals(Ci.nsISupports) ||
      aIid.equals(Ci.nsIStreamConverter) ||
      aIid.equals(Ci.nsIStreamListener) ||
      aIid.equals(Ci.nsIRequestObserver)) {
      return this;
    }
    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  // nsIRequest::onStartRequest
  onStartRequest: function (aReq, aCtx) {
    this.init();
    this._logger.logStringMessage("Entered onStartRequest");
    this.data = "";
    this.uri = aReq.QueryInterface(Ci.nsIChannel).URI.spec;
    this.channel = aReq;
    this._logger.logStringMessage(this.channel.contentType);
    this.channel.contentType = "text/html";
    this._logger.logStringMessage(this.channel.contentType);
    this.listener.onStartRequest(this.channel, aCtx);
    this._logger.logStringMessage("Exiting onStartRequest");
  },

  // nsIRequest::onStopRequest
  onStopRequest: function (aReq, aCtx, aStatus) {
    var prettyPrinted = "";
    try {
      var jsonData = this.JSON.parse(this.data);
      var prettyPrintedStr = this.JSON.stringify(jsonData, null, 2);
      var prettyPrintedLines = prettyPrintedStr.split("\n");
      for (i = 0; i < prettyPrintedLines.length; i++)
	prettyPrintedLines[i] = "<span class='nocode' unselectable='on'>" + (i + 1) + "</span> " + prettyPrintedLines[i];
      prettyPrinted = prettyPrintedLines.join("\n");
    }
    catch(e) {
      prettyPrinted = e;
    }
    var htmlDocument = "<html>\n" +
      "  <head>\n" +
      "    <title>"+ this.uri + "</title>\n" +
      "    <style type='text/css'>\n" +
      "      .nocode{user-select:none;-moz-user-select:none;color:#888}.str{color:#080}.kwd{color:#008}.com{color:#800}.typ{color:#606}.lit{color:#066}.pun{color:#660}.pln{color:#000}.tag{color:#008}.atn{color:#606}.atv{color:#080}.dec{color:#606}pre.prettyprint{padding:2px;border:0px solid #888}@media print{.str{color:#060}.kwd{color:#006;font-weight:bold}.com{color:#600;font-style:italic}.typ{color:#404;font-weight:bold}.lit{color:#044}.pun{color:#440}.pln{color:#000}.tag{color:#006;font-weight:bold}.atn{color:#404}.atv{color:#060}}pre{white-space: pre-wrap; /* css-3 */ white-space: -moz-pre-wrap; /* Mozilla, since 1999 */white-space: -pre-wrap;  /* Opera 4-6 */ white-space: -o-pre-wrap;    /* Opera 7 */ word-wrap: break-word; /* Internet Explorer 5.5+ */}\n" +
      "    </style>\n" +
      "<!-- Following code is licensed under Apache 2.0, available from http://code.google.com/p/google-code-prettify/ --> \n" +
      "    <script type='text/javascript'><!--\n" +
      'function _pr_isIE6(){var F=navigator&&navigator.userAgent&&/\\bMSIE 6\\./.test(navigator.userAgent);_pr_isIE6=function(){return F};return F}var aa="break continue do else for if return while ",ba="auto case char const default double enum extern float goto int long register short signed sizeof static struct switch typedef union unsigned void volatile ",ca="catch class delete false import new operator private protected public this throw true try ",da="alignof align_union asm axiom bool concept concept_map const_cast constexpr decltype dynamic_cast explicit export friend inline late_check mutable namespace nullptr reinterpret_cast static_assert static_cast template typeid typename typeof using virtual wchar_t where ",' +
      'ea="boolean byte extends final finally implements import instanceof null native package strictfp super synchronized throws transient ",fa="as base by checked decimal delegate descending event fixed foreach from group implicit in interface internal into is lock object out override orderby params readonly ref sbyte sealed stackalloc string select uint ulong unchecked unsafe ushort var ",ga="debugger eval export function get null set undefined var with Infinity NaN ",ha="caller delete die do dump elsif eval exit foreach for goto if import last local my next no our print package redo require sub undef unless until use wantarray while BEGIN END ",' +
      'ia="and as assert class def del elif except exec finally from global import in is lambda nonlocal not or pass print raise try with yield False True None ",ja="alias and begin case class def defined elsif end ensure false in module next nil not or redo rescue retry self super then true undef unless until when yield BEGIN END ",ka="case done elif esac eval fi function in local set then until ",la="a",ma="z",na="A",oa="Z",pa="!",qa="!=",ra="!==",s="#",sa="%",Ha="%=",v="&",Ia="&&",Ja="&&=",Ka="&=",La=' +
      '"(",Ma="*",Na="*=",Oa="+=",Pa=",",Qa="-=",Ra="->",w="/",Sa="/=",Ta=":",Ua="::",y=";",z="<",Va="<<",Wa="<<=",Xa="<=",Ya="=",Za="==",$a="===",A=">",ab=">=",bb=">>",cb=">>=",db=">>>",eb=">>>=",fb="?",C="@",gb="[",hb="^",ib="^=",jb="^^",kb="^^=",lb="{",mb="|",nb="|=",ob="||",pb="||=",qb="~",rb="break",sb="case",tb="continue",ub="delete",vb="do",wb="else",xb="finally",yb="instanceof",zb="return",Ab="throw",Bb="try",Cb="typeof",Db="(?:(?:(?:^|[^0-9.])\\\\.{1,3})|(?:(?:^|[^\\\\+])\\\\+)|(?:(?:^|[^\\\\-])-)",Eb=' +
      '"|\\\\b",Fb="\\\\$1",Gb="|^)\\\\s*$",Hb="&amp;",Ib="&lt;",Jb="&gt;",Kb="&quot;",Lb="&#",Mb="x",Nb="\'",G=\'"\',Ob=" ",Pb="XMP",Qb="</",Rb=\'="\',H="PRE",Sb=\'<!DOCTYPE foo PUBLIC "foo bar">\\n<foo />\',I="",Tb="\\t",Ub="\\n",Vb="nocode",Wb=\' $1="$2$3$4"\',J="pln",O="com",Xb="dec",P="src",Q="tag",R="atv",S="pun",Yb="<>/=",X="atn",Zb=" \\t\\r\\n",Y="str",$b="\'\\"",ac="\'\\"`",bc="\\"\'",cc=" \\r\\n",Z="lit",dc="123456789",ec=".",fc="kwd",gc="typ",$="</span>",hc=\'<span class="\',ic=\'">\',jc="$1&nbsp;",kc="<br />",lc="console",mc=' +
      '"cannot override language handler %s",nc="default-code",oc="default-markup",pc="html",qc="htm",rc="xhtml",sc="xml",tc="xsl",uc="c",vc="cc",wc="cpp",xc="cs",yc="cxx",zc="cyc",Ac="java",Bc="bsh",Cc="csh",Dc="sh",Ec="cv",Fc="py",Gc="perl",Hc="pl",Ic="pm",Jc="rb",Kc="js",Lc="pre",Mc="code",Nc="xmp",Oc="prettyprint",Pc="class",Qc="br",Rc="\\r\\n";(function(){function F(b){b=b.split(/ /g);var a={};for(var c=b.length;--c>=0;){var d=b[c];if(d)a[d]=null}return a}var K=aa,Sc=K+ba,T=Sc+ca,ta=T+da,ua=T+ea,Tc=ua+' +
      'fa,va=T+ga,wa=ha,xa=K+ia,ya=K+ja,za=K+ka,Uc=ta+Tc+va+wa+xa+ya+za;function Vc(b){return b>=la&&b<=ma||b>=na&&b<=oa}function D(b,a,c,d){b.unshift(c,d||0);try{a.splice.apply(a,b)}finally{b.splice(0,2)}}var Wc=(function(){var b=[pa,qa,ra,s,sa,Ha,v,Ia,Ja,Ka,La,Ma,Na,Oa,Pa,Qa,Ra,w,Sa,Ta,Ua,y,z,Va,Wa,Xa,Ya,Za,$a,A,ab,bb,cb,db,eb,fb,C,gb,hb,ib,jb,kb,lb,mb,nb,ob,pb,qb,rb,sb,tb,ub,vb,wb,xb,yb,zb,Ab,Bb,Cb],a=Db;for(var c=0;c<b.length;++c){var d=b[c];a+=Vc(d.charAt(0))?Eb+d:mb+d.replace(/([^=<>:&])/g,Fb)}a+=' +
      'Gb;return new RegExp(a)})(),Aa=/&/g,Ba=/</g,Ca=/>/g,Xc=/\\"/g;function Yc(b){return b.replace(Aa,Hb).replace(Ba,Ib).replace(Ca,Jb).replace(Xc,Kb)}function U(b){return b.replace(Aa,Hb).replace(Ba,Ib).replace(Ca,Jb)}var Zc=/&lt;/g,$c=/&gt;/g,ad=/&apos;/g,bd=/&quot;/g,cd=/&amp;/g,dd=/&nbsp;/g;function ed(b){var a=b.indexOf(v);if(a<0)return b;for(--a;(a=b.indexOf(Lb,a+1))>=0;){var c=b.indexOf(y,a);if(c>=0){var d=b.substring(a+3,c),g=10;if(d&&d.charAt(0)===Mb){d=d.substring(1);g=16}var e=parseInt(d,g);' +
      'if(!isNaN(e))b=b.substring(0,a)+String.fromCharCode(e)+b.substring(c+1)}}return b.replace(Zc,z).replace($c,A).replace(ad,Nb).replace(bd,G).replace(cd,v).replace(dd,Ob)}function Da(b){return Pb===b.tagName}function L(b,a){switch(b.nodeType){case 1:var c=b.tagName.toLowerCase();a.push(z,c);for(var d=0;d<b.attributes.length;++d){var g=b.attributes[d];if(!g.specified)continue;a.push(Ob);L(g,a)}a.push(A);for(var e=b.firstChild;e;e=e.nextSibling)L(e,a);if(b.firstChild||!/^(?:br|link|img)$/.test(c))a.push(Qb,' +
      'c,A);break;case 2:a.push(b.name.toLowerCase(),Rb,Yc(b.value),G);break;case 3:case 4:a.push(U(b.nodeValue));break}}var V=null;function fd(b){if(null===V){var a=document.createElement(H);a.appendChild(document.createTextNode(Sb));V=!/</.test(a.innerHTML)}if(V){var c=b.innerHTML;if(Da(b))c=U(c);return c}var d=[];for(var g=b.firstChild;g;g=g.nextSibling)L(g,d);return d.join(I)}function gd(b){var a=0;return function(c){var d=null,g=0;for(var e=0,h=c.length;e<h;++e){var f=c.charAt(e);switch(f){case Tb:if(!d)d=' +
      '[];d.push(c.substring(g,e));var i=b-a%b;a+=i;for(;i>=0;i-="                ".length)d.push("                ".substring(0,i));g=e+1;break;case Ub:a=0;break;default:++a}}if(!d)return c;d.push(c.substring(g));return d.join(I)}}var hd=/(?:[^<]+|<!--[\\s\\S]*?--\\>|<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|<\\/?[a-zA-Z][^>]*>|<)/g,id=/^<!--/,jd=/^<\\[CDATA\\[/,kd=/^<br\\b/i,Ea=/^<(\\/?)([a-zA-Z]+)/;function ld(b){var a=b.match(hd),c=[],d=0,g=[];if(a)for(var e=0,h=a.length;e<h;++e){var f=a[e];if(f.length>1&&f.charAt(0)===z){if(id.test(f))continue;' +
      'if(jd.test(f)){c.push(f.substring(9,f.length-3));d+=f.length-12}else if(kd.test(f)){c.push(Ub);++d}else if(f.indexOf(Vb)>=0&&!!f.replace(/\\s(\\w+)\\s*=\\s*(?:\\"([^\\"]*)\\"|\'([^\']*)\'|(\\S+))/g,Wb).match(/[cC][lL][aA][sS][sS]=\\"[^\\"]*\\bnocode\\b/)){var i=f.match(Ea)[2],j=1;end_tag_loop:for(var m=e+1;m<h;++m){var o=a[m].match(Ea);if(o&&o[2]===i)if(o[1]===w){if(--j===0)break end_tag_loop}else++j}if(m<h){g.push(d,a.slice(e,m+1).join(I));e=m}else g.push(d,f)}else g.push(d,f)}else{var k=ed(f);c.push(k);d+=k.length}}return{source:c.join(I),' +
      'tags:g}}function E(b,a){var c={};(function(){var e=b.concat(a);for(var h=e.length;--h>=0;){var f=e[h],i=f[3];if(i)for(var j=i.length;--j>=0;)c[i.charAt(j)]=f}})();var d=a.length,g=/\\S/;return function(e,h){h=h||0;var f=[h,J],i=I,j=0,m=e;while(m.length){var o,k=null,p,l=c[m.charAt(0)];if(l){p=m.match(l[1]);k=p[0];o=l[0]}else{for(var n=0;n<d;++n){l=a[n];var q=l[2];if(q&&!q.test(i))continue;p=m.match(l[1]);if(p){k=p[0];o=l[0];break}}if(!k){o=J;k=m.substring(0,1)}}f.push(h+j,o);j+=k.length;m=m.substring(k.length);' +
      'if(o!==O&&g.test(k))i=k}return f}}var md=E([],[[J,/^[^<]+/,null],[Xb,/^<!\\w[^>]*(?:>|$)/,null],[O,/^<!--[\\s\\S]*?(?:--\\>|$)/,null],[P,/^<\\?[\\s\\S]*?(?:\\?>|$)/,null],[P,/^<%[\\s\\S]*?(?:%>|$)/,null],[P,/^<(script|style|xmp)\\b[^>]*>[\\s\\S]*?<\\/\\1\\b[^>]*>/i,null],[Q,/^<\\/?\\w[^<>]*>/,null]]);function nd(b){var a=md(b);for(var c=0;c<a.length;c+=2)if(a[c+1]===P){var d,g;d=a[c];g=c+2<a.length?a[c+2]:b.length;var e=b.substring(d,g),h=e.match(/^(<[^>]*>)([\\s\\S]*)(<\\/[^>]*>)$/);if(h)a.splice(c,2,d,Q,d+h[1].length,' +
      'P,d+h[1].length+(h[2]||I).length,Q)}return a}var od=E([[R,/^\'[^\']*(?:\'|$)/,null,Nb],[R,/^\\"[^\\"]*(?:\\"|$)/,null,G],[S,/^[<>\\/=]+/,null,Yb]],[[Q,/^[\\w:\\-]+/,/^</],[R,/^[\\w\\-]+/,/^=/],[X,/^[\\w:\\-]+/,null],[J,/^\\s+/,null,Zb]]);function pd(b,a){for(var c=0;c<a.length;c+=2){var d=a[c+1];if(d===Q){var g,e;g=a[c];e=c+2<a.length?a[c+2]:b.length;var h=b.substring(g,e),f=od(h,g);D(f,a,c,2);c+=f.length-2}}return a}function u(b){var a=[],c=[];if(b.tripleQuotedStrings)a.push([Y,/^(?:\'\'\'(?:[^\'\\\\]|\\\\[\\s\\S]|\'{1,2}(?=[^\']))*(?:\'\'\'|$)|\\"\\"\\"(?:[^\\"\\\\]|\\\\[\\s\\S]|\\"{1,2}(?=[^\\"]))*(?:\\"\\"\\"|$)|\'(?:[^\\\\\']|\\\\[\\s\\S])*(?:\'|$)|\\"(?:[^\\\\\"]|\\\\[\\s\\S])*(?:\\"|$))/,' +
      'null,$b]);else if(b.multiLineStrings)a.push([Y,/^(?:\'(?:[^\\\\\']|\\\\[\\s\\S])*(?:\'|$)|\\"(?:[^\\\\\"]|\\\\[\\s\\S])*(?:\\"|$)|\\`(?:[^\\\\\\`]|\\\\[\\s\\S])*(?:\\`|$))/,null,ac]);else a.push([Y,/^(?:\'(?:[^\\\\\'\\r\\n]|\\\\.)*(?:\'|$)|\\"(?:[^\\\\\"\\r\\n]|\\\\.)*(?:\\"|$))/,null,bc]);c.push([J,/^(?:[^\'\\"\\`\\/\\#]+)/,null,cc]);if(b.hashComments)a.push([O,/^#[^\\r\\n]*/,null,s]);if(b.cStyleComments){c.push([O,/^\\/\\/[^\\r\\n]*/,null]);c.push([O,/^\\/\\*[\\s\\S]*?(?:\\*\\/|$)/,null])}if(b.regexLiterals)c.push([Y,/^\\/(?=[^\\/*])(?:[^\\/\\x5B\\x5C]|\\x5C[\\s\\S]|\\x5B(?:[^\\x5C\\x5D]|\\x5C[\\s\\S])*(?:\\x5D|$))+(?:\\/|$)/,' +
      'Wc]);var d=F(b.keywords);b=null;var g=E(a,c),e=E([],[[J,/^\\s+/,null,cc],[J,/^[a-z_$@][a-z_$@0-9]*/i,null],[Z,/^0x[a-f0-9]+[a-z]/i,null],[Z,/^(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d+)(?:e[+\\-]?\\d+)?[a-z]*/i,null,dc],[S,/^[^\\s\\w\\.$@]+/,null]]);function h(f,i){for(var j=0;j<i.length;j+=2){var m=i[j+1];if(m===J){var o,k,p,l;o=i[j];k=j+2<i.length?i[j+2]:f.length;p=f.substring(o,k);l=e(p,o);for(var n=0,q=l.length;n<q;n+=2){var r=l[n+1];if(r===J){var B=l[n],M=n+2<q?l[n+2]:p.length,x=f.substring(B,M);if(x===ec)l[n+' +
      '1]=S;else if(x in d)l[n+1]=fc;else if(/^@?[A-Z][A-Z$]*[a-z][A-Za-z$]*$/.test(x))l[n+1]=x.charAt(0)===C?Z:gc}}D(l,i,j,2);j+=l.length-2}}return i}return function(f){var i=g(f);i=h(f,i);return i}}var W=u({keywords:Uc,hashComments:true,cStyleComments:true,multiLineStrings:true,regexLiterals:true});function qd(b,a){for(var c=0;c<a.length;c+=2){var d=a[c+1];if(d===P){var g,e;g=a[c];e=c+2<a.length?a[c+2]:b.length;var h=W(b.substring(g,e));for(var f=0,i=h.length;f<i;f+=2)h[f]+=g;D(h,a,c,2);c+=h.length-2}}return a}' +
      'function rd(b,a){var c=false;for(var d=0;d<a.length;d+=2){var g=a[d+1],e,h;if(g===X){e=a[d];h=d+2<a.length?a[d+2]:b.length;c=/^on|^style$/i.test(b.substring(e,h))}else if(g===R){if(c){e=a[d];h=d+2<a.length?a[d+2]:b.length;var f=b.substring(e,h),i=f.length,j=i>=2&&/^[\\"\']/.test(f)&&f.charAt(0)===f.charAt(i-1),m,o,k;if(j){o=e+1;k=h-1;m=f}else{o=e+1;k=h-1;m=f.substring(1,f.length-1)}var p=W(m);for(var l=0,n=p.length;l<n;l+=2)p[l]+=o;if(j){p.push(k,R);D(p,a,d+2,0)}else D(p,a,d,2)}c=false}}return a}function sd(b){var a=' +
      'nd(b);a=pd(b,a);a=qd(b,a);a=rd(b,a);return a}function td(b,a,c){var d=[],g=0,e=null,h=null,f=0,i=0,j=gd(8),m=/([\\r\\n ]) /g,o=/(^| ) /gm,k=/\\r\\n?|\\n/g,p=/[ \\r\\n]$/,l=true;function n(r){if(r>g){if(e&&e!==h){d.push($);e=null}if(!e&&h){e=h;d.push(hc,e,ic)}var B=U(j(b.substring(g,r))).replace(l?o:m,jc);l=p.test(B);d.push(B.replace(k,kc));g=r}}while(true){var q;q=f<a.length?(i<c.length?a[f]<=c[i]:true):false;if(q){n(a[f]);if(e){d.push($);e=null}d.push(a[f+1]);f+=2}else if(i<c.length){n(c[i]);h=c[i+1];i+=' +
      '2}else break}n(b.length);if(e)d.push($);return d.join(I)}var N={};function t(b,a){for(var c=a.length;--c>=0;){var d=a[c];if(!N.hasOwnProperty(d))N[d]=b;else if(lc in window)console.log(mc,d)}}t(W,[nc]);t(sd,[oc,pc,qc,rc,sc,tc]);t(u({keywords:ta,hashComments:true,cStyleComments:true}),[uc,vc,wc,xc,yc,zc]);t(u({keywords:ua,cStyleComments:true}),[Ac]);t(u({keywords:za,hashComments:true,multiLineStrings:true}),[Bc,Cc,Dc]);t(u({keywords:xa,hashComments:true,multiLineStrings:true,tripleQuotedStrings:true}),' +
      '[Ec,Fc]);t(u({keywords:wa,hashComments:true,multiLineStrings:true,regexLiterals:true}),[Gc,Hc,Ic]);t(u({keywords:ya,hashComments:true,multiLineStrings:true,regexLiterals:true}),[Jc]);t(u({keywords:va,cStyleComments:true,regexLiterals:true}),[Kc]);function Fa(b,a){try{var c=ld(b),d=c.source,g=c.tags;if(!N.hasOwnProperty(a))a=/^\\s*</.test(d)?oc:nc;var e=N[a].call({},d);return td(d,g,e)}catch(h){if(lc in window){console.log(h);console.trace()}return b}}function ud(b){var a=_pr_isIE6(),c=[document.getElementsByTagName(Lc),' +
      'document.getElementsByTagName(Mc),document.getElementsByTagName(Nc)],d=[];for(var g=0;g<c.length;++g)for(var e=0;e<c[g].length;++e)d.push(c[g][e]);c=null;var h=0;function f(){var i=(new Date).getTime()+250;for(;h<d.length&&(new Date).getTime()<i;h++){var j=d[h];if(j.className&&j.className.indexOf(Oc)>=0){var m=j.className.match(/\\blang-(\\w+)\\b/);if(m)m=m[1];var o=false;for(var k=j.parentNode;k;k=k.parentNode)if((k.tagName===Lc||k.tagName===Mc||k.tagName===Nc)&&k.className&&k.className.indexOf(Oc)>=' +
      '0){o=true;break}if(!o){var p=fd(j);p=p.replace(/(?:\\r\\n?|\\n)$/,I);var l=Fa(p,m);if(!Da(j))j.innerHTML=l;else{var n=document.createElement(H);for(var q=0;q<j.attributes.length;++q){var r=j.attributes[q];if(r.specified){var B=r.name.toLowerCase();if(B===Pc)n.className=r.value;else n.setAttribute(r.name,r.value)}}n.innerHTML=l;j.parentNode.replaceChild(n,j);j=n}if(a&&j.tagName===H){var M=j.getElementsByTagName(Qc);for(var x=M.length;--x>=0;){var Ga=M[x];Ga.parentNode.replaceChild(document.createTextNode(Rc),' +
      'Ga)}}}}}if(h<d.length)setTimeout(f,250);else if(b)b()}f()}window.PR_normalizedHtml=L;window.prettyPrintOne=Fa;window.prettyPrint=ud;window.PR={createSimpleLexer:E,registerLangHandler:t,sourceDecorator:u,PR_ATTRIB_NAME:X,PR_ATTRIB_VALUE:R,PR_COMMENT:O,PR_DECLARATION:Xb,PR_KEYWORD:fc,PR_LITERAL:Z,PR_NOCODE:Vb,PR_PLAIN:J,PR_PUNCTUATION:S,PR_SOURCE:P,PR_STRING:Y,PR_TAG:Q,PR_TYPE:gc}})();\n' +
      "    // -->\n" +
      "    </script>\n" +
      "  </head>\n" +
      "  <body onload='prettyPrint()'>\n" +
      "    <pre class='prettyprint lang-js'>\n" +
      prettyPrinted +
      "    </pre>\n" +
      "  </body>\n" +
      "</html>\n";

    var converter = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
                      .createInstance(Ci.nsIScriptableUnicodeConverter);
    converter.charset = "UTF-8";
    var stream = converter.convertToInputStream(htmlDocument);
    var len = stream.available();

    // Pass the data to the main content listener
    this.listener.onDataAvailable(this.channel, aCtx, stream, 0, len);
    this.listener.onStopRequest(this.channel, aCtx, aStatus);
  },

  // nsIStreamListener methods
  onDataAvailable: function (aReq, aCtx, aStream, aOffset, aCount) {
    this._logger.logStringMessage("Entered onDataAvailable");
    var sis = Cc["@mozilla.org/scriptableinputstream;1"].createInstance();
    sis = sis.QueryInterface(Ci.nsIScriptableInputStream);
    sis.init(aStream);
    this.data += sis.read(aCount);
    this._logger.logStringMessage("Exiting onDataAvailable");
  },

  asyncConvertData: function (aFromType, aToType, aListener, aCtx) {
    // Store the listener passed to us
    this.listener = aListener;
  },

  convert: function (aStream, aFromType, aToType, aCtx) {
    return aStream;
  }
};

var JSONBrowserModule = {
  cid: Components.ID("{dcc31be0-c861-11dd-ad8b-0800200c9a66}"),
  conversion1: "?from=application/json&to=*/*",
  conversion2: "?from=text/x-json&to=*/*",
  contractID: "@mozilla.org/streamconv;1",
  name: "JSON pretty-printer",

  // This factory attribute returns an anonymous class
  factory: {
    createInstance: function (aOuter, aIid) {
      if (aOuter != null) {
        throw Cr.NS_ERROR_NO_AGGREGATION;
      }
      if (aIid.equals(Ci.nsISupports) ||
        aIid.equals(Ci.nsIStreamConverter) ||
        aIid.equals(Ci.nsIStreamListener) ||
        aIid.equals(Ci.nsIRequestObserver)) {
        return new JSONStreamConverter();
      }
      throw Cr.NS_ERROR_NO_INTERFACE;
    }
  },

  registerSelf: function (aCompMgr, aFileSpec, aLocation, aType) {
    aCompMgr = aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(this.cid, this.name,
            this.contractID + this.conversion1,
            aFileSpec, aLocation, aType);
    aCompMgr.registerFactoryLocation(this.cid, this.name,
            this.contractID + this.conversion2,
            aFileSpec, aLocation, aType);
  },

  unregisterSelf: function (aCompMgr, aFileSpec, aLocation) {
    aCompMgr = aCompMgr.QueryInterface(Ci.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(this.cid, aLocation);
  },

  getClassObject: function (aCompMgr, aCid, aIid) {
    if (aCid.equals(this.cid)) {
      return this.factory;
    }
    if (!aIid.equals(Ci.nsIFactory)) {
      throw Cr.NS_ERROR_NOT_IMPLEMENTED;
    }
    throw Cr.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function (aCompMgr) {
    return true;
  }
};

/* entrypoint */
function NSGetModule(aCompMgr, aFileSpec) {
  return JSONBrowserModule;
};