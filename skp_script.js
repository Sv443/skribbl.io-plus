// ==UserScript==
// @name           skribbl.io+
// @name:de        skribbl.io+
// @version        0.1
// @description    Skribbl.io improvements
// @description:de Skribbl.io Verbesserungen
// @namespace      https://github.com/Sv443
// @author         Sv443
// @license        MIT
// @copyright      2018, Sv443 (https://github.com/Sv443)
// @match          http*://www.skribbl.io/*
// @match          http*://skribbl.io/*
// @grant          GM_addStyle
// @grant          GM_listValues
// @grant          GM_deleteValue
// @grant          GM_setValue
// @grant          GM_getValue
// @grant          GM_openInTab
// @grant          GM_notification
// @grant          GM_setClipboard
// @icon           https://raw.githubusercontent.com/Sv443/code/master/resources/favicons/skribbl.io%2B%20icon.png
// @run-at         document-start
// @require        https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @connect        self
// @connect        *
// @updateURL      X
// @downloadURL    X
// @supportURL     https://github.com/Sv443/Skribbl.io+/issues
// ==/UserScript==



/*\  \  \                          Settings                                Settings                                Settings                                Settings                      /  /  /*/
/* \  \  \   Settings                                Settings                                Settings                                Settings                                Settings   /  /  / */
/* /  /  /                         Settings                                Settings                                Settings                                Settings                     \  \  \ */
/*/  /  /    Settings                                Settings                                Settings                                Settings                                Settings    \  \  \*/

var dbg = true; //enable javascript console debug (default: false, can be true or false)
var lang = "en"; //change the localization ("en" for english, "de" for german)
var del_content = "X"; //content of the delete box (default: "X") (you can also use HTML if you want to) (also, change it to "<x>" for a special, little, hidden effect :D)


var feature_delete_messages = true; //feature that prepends a delete box on every message that deletes it on click (it's a bit useless but eh, why not?) (default: true, can be true or false)
var feature_download_png = true; //adds a download as png button underneath the votekick button (default: true, can be true or false)
var feature_watermark = true; //adds a watermark, if you don't like it, you can disable it here (default: true, can be true or false)











/* Changelog        Changelog        Changelog        Changelog        Changelog        Changelog        Changelog        Changelog */

// what's new in this version:
// - prepends delete box on every message that deletes it on click
// - appends download drawing button underneath the votekick button






var curversion = GM_info.script.version;
var URLhost = window.location.host;
var URLpath = window.location.pathname;
var curURL = URLhost + "" + URLpath;
var qStr = window.location.search.substring(1);
var running = false;


var lang_delete_message, lang_deleted, lang_download_as_png, lang_download_as_png_desc, lang_with, lang_opens_in_new_tab;
switch(lang){
    case "en":
        lang_delete_message = "Delete this message";
        lang_deleted = "deleted";
        lang_download_as_png = "Download Drawing";
        lang_download_as_png_desc = "Click to download the drawing as a PNG file";
        lang_with = "with";
        lang_opens_in_new_tab = "(Opens in a new tab)";
        break;
    case "de":
        lang_delete_message = "Lösche diese Nachricht";
        lang_deleted = "gelöscht";
        lang_download_as_png = "Zeichnung herunterladen";
        lang_download_as_png_desc = "Klicke, um die Zeichnung als PNG herunterzuladen";
        lang_with = "mit";
        lang_opens_in_new_tab = "(Öffnet sich in einem neuen Tab)";
        break;
    default:
        lang_delete_message = "Delete this message";
        lang_deleted = "deleted";
        lang_download_as_png = "Download Drawing";
        lang_download_as_png_desc = "Click to download the drawing as a PNG file";
        lang_with = "with";
        lang_opens_in_new_tab = "(Opens in a new tab)";
        break;
}


(function() {
'use strict';

console.log("skribbl.io+ v" + curversion + " - by Sv443 / Sven Fehler - GitHub: https://github.com/sv443/skribbl.io-plus");
console.log("skribbl.io+ - Debug enabled: " + dbg);
if(dbg) {
    console.log("--BEGIN skribbl.io+ Debug");
}

setInterval(function(){
    if(isrunning() === true){
        GM_setValue("running", "true");
    }
    else{
        GM_setValue("running", "false");
    }
}, 500);

function isrunning() {
    if(document.getElementById("timer").innerHTML < 80){return true;}
    else{return false;}
}

setInterval(function(){

/*Delete Messages                              Delete Messages                                  Delete Messages                              Delete Messages                                  Delete Messages*/
/*Delete Messages                              Delete Messages                                  Delete Messages                              Delete Messages                                  Delete Messages*/

    if(feature_delete_messages){
        var appendvalue = '<span id="skp_del_message" class="skp_msg_del" style="text-decoration:none;font-weight:bold;color:red;cursor:pointer;" title="' + lang_delete_message + '">' + del_content + '</span>&nbsp;&nbsp;';
        running = parseBool(GM_getValue("running"));
        if(running){
            var cn = document.getElementById("boxMessages").childNodes;
            for(var i = 0; i < cn.length; i++){
                var cnih = cn[i].innerHTML;
                if(!cnih.includes(appendvalue) && !cnih.includes("(" + lang_deleted + ")")){
                    cn[i].innerHTML=appendvalue + cnih;
                    cn[i].querySelector("#skp_del_message").addEventListener("click", function(){this.parentNode.innerHTML="(" + lang_deleted + ")";});
                }
                if(cnih === undefined){break;}
            }
        }
    }

/*UI                              UI                                  UI                              UI                                  UI                                  UI                                  UI*/
/*UI                              UI                                  UI                              UI                                  UI                                  UI                                  UI*/

    if(feature_download_png){
        document.addEventListener("DOMContentLoaded", function() {
            if(!document.body.innerHTML.includes("skp_dl_elem")){
                var canvas = document.getElementById("canvasGame");
                var skp_dl_elem = document.createElement("a");
                skp_dl_elem.id="skp_dl_elem";
                skp_dl_elem.innerHTML='<br><button class="btn btn-warning btn-block" title="' + lang_download_as_png_desc + '">' + lang_download_as_png + '</button>';
                skp_dl_elem.addEventListener("click", function(){
                    skp_dl_elem.href = canvas.toDataURL();
                    if(dbg){console.log("downloading drawing");}
                    skp_dl_elem.download = "skribbl_io.png";
                });
                document.getElementsByClassName("tooltip-wrapper")[0].appendChild(skp_dl_elem);
            }
        });
    }

    if(feature_watermark){
            running = parseBool(GM_getValue("running"));
        if(!document.body.innerHTML.includes("skp_watermark")){
            var watermark = document.createElement("div");
            watermark.innerHTML= lang_with + " skribbl.io+ v" + curversion + ' <a href="https://www.github.com/Sv443" target="blank_" title="' + lang_opens_in_new_tab + '">(GitHub)</a>';
            watermark.id="skp_watermark";
            watermark.align="center";
            watermark.style="color:white;font-size:1.75em;";
            document.getElementsByClassName("header")[0].appendChild(watermark);
        }
            if(running === true){
            document.getElementById("skp_watermark").align="left";
            document.getElementById("skp_watermark").style="color:white;font-size:1.25em;";
        }
        else if(running === false) {
            document.getElementById("skp_watermark").align="center";
            document.getElementById("skp_watermark").style="color:white;font-size:1.25em;";
        }
    }


}, 100);



function parseBool(val) {
	return val === true || val === "true";
}

if(dbg) {
    console.log("--END Skribbl.io+ Debug");
}
})();
