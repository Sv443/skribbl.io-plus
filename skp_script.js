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
// @updateURL      https://raw.githubusercontent.com/Sv443/skribbl.io-plus/master/skp_script.js
// @downloadURL    https://raw.githubusercontent.com/Sv443/skribbl.io-plus/master/skp_script.js
// @supportURL     https://github.com/Sv443/skribbl.io-plus/issues
// ==/UserScript==



/*\  \  \                          Settings                                Settings                                Settings                                Settings                      /  /  /*/
/* \  \  \   Settings                                Settings                                Settings                                Settings                                Settings   /  /  / */
/* /  /  /                         Settings                                Settings                                Settings                                Settings                     \  \  \ */
/*/  /  /    Settings                                Settings                                Settings                                Settings                                Settings    \  \  \*/

var dbg = true; //enable javascript console debug (default: false, can be true or false)
var lang = "de"; //change the localization ("en" for english, "de" for german)
var del_content = "X"; //content of the delete box (default: "X") (you can also use HTML if you want to) (also, change it to "<x>" for a special, little, hidden effect :D)


var feature_delete_messages = true; //feature that prepends a delete box on every message that deletes it on click (it's a bit useless but eh, why not?) (default: true, can be true or false)
var feature_download_png = true; //adds a download as png button underneath the votekick button (default: true, can be true or false)
var feature_watermark = true; //adds a watermark, if you don't like it, you can disable it here (default: true, can be true or false)
var feature_hard_mode = true; //adds a button that can switch to hard mode on click (the hint at the top will disappear) (default: true, can be true or false)










/* Changelog        Changelog        Changelog        Changelog        Changelog        Changelog        Changelog        Changelog */

// what's new in this version:
// - prepends delete box on every message that deletes it on click
// - appends download drawing button underneath the votekick button
// - appends hard mode button underneath the download drawing button that disables the word hint at the top and the chat






var curversion = GM_info.script.version;
var URLhost = window.location.host;
var URLpath = window.location.pathname;
var curURL = URLhost + "" + URLpath;
var qStr = window.location.search.substring(1);
var running = false;


var lang_delete_message, lang_deleted, lang_download_as_png, lang_download_as_png_desc, lang_opens_in_new_tab, lang_activate_hard_mode, lang_activate_hard_mode_desc, lang_word_hint_disabled, lang_chat_disabled;
var lang_confirm_hard_mode;
switch(lang){
    case "en":
        lang_delete_message = "Delete this message";
        lang_deleted = "deleted";
        lang_download_as_png = "Download Drawing";
        lang_download_as_png_desc = "Click to download the drawing as a PNG file";
        lang_opens_in_new_tab = "(Opens in a new tab)";
        lang_activate_hard_mode = "Hard Mode";
        lang_activate_hard_mode_desc = "Removes the word hint at the top and disables the chat";
        lang_word_hint_disabled = "(hints disabled)";
        lang_chat_disabled = "(chat disabled)";
        lang_confirm_hard_mode = "Do you really want to activate the hard mode?\nThis will disable the word hint and the chat and can only be undone by reloading the page.";
        break;
    case "de":
        lang_delete_message = "Lösche diese Nachricht";
        lang_deleted = "gelöscht";
        lang_download_as_png = "Zeichnung herunterladen";
        lang_download_as_png_desc = "Klicke, um die Zeichnung als PNG herunterzuladen";
        lang_opens_in_new_tab = "(Öffnet sich in einem neuen Tab)";
        lang_activate_hard_mode = "Schwerer Modus";
        lang_activate_hard_mode_desc = "Entfernt den Worthinweis oben und deaktiviert den Chat";
        lang_word_hint_disabled = "(Hinweise deaktiviert)";
        lang_chat_disabled = "(Chat deaktiviert)";
        lang_confirm_hard_mode = "Willst du wirklich den schweren Modus aktivieren?\nDies wird alle Worthinweise und den Chat deaktivieren und kann nur rückgängig gemacht werden, wenn du die Seite neu lädst.";
        break;
    default:
        lang_delete_message = "Delete this message";
        lang_deleted = "deleted";
        lang_download_as_png = "Download Drawing";
        lang_download_as_png_desc = "Click to download the drawing as a PNG file";
        lang_opens_in_new_tab = "(Opens in a new tab)";
        lang_activate_hard_mode = "Hard Mode";
        lang_activate_hard_mode_desc = "Removes the word hint at the top and disables the chat";
        lang_word_hint_disabled = "(hints disabled)";
        lang_chat_disabled = "(chat disabled)";
        lang_confirm_hard_mode = "Do you really want to activate the hard mode?\nThis will disable the word hint and the chat and can only be undone by reloading the page.";
        break;
}


(function() {
'use strict';

console.log("skribbl.io+ v" + curversion + " - by Sv443 / Sven Fehler - GitHub: https://github.com/sv443/skribbl.io-plus      - debug enabled: " + dbg);

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
        var prependvalue = '<span id="skp_del_message" class="skp_msg_del" style="text-decoration:none;font-weight:bold;color:red;cursor:pointer;" title="' + lang_delete_message + '">' + del_content + '</span>&nbsp;&nbsp;';
        running = parseBool(GM_getValue("running"));
        if(running){
            var cn = document.getElementById("boxMessages").childNodes;
            for(var i = 0; i < cn.length; i++){
                var cnih = cn[i].innerHTML;
                if(!cnih.includes(prependvalue) && !cnih.includes("(" + lang_deleted + ")")){
                    cn[i].innerHTML=prependvalue + cnih;
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
                skp_dl_elem.style="text-decoration:none;";
                skp_dl_elem.innerHTML='<div style="height:1vh;"></div><button class="btn btn-warning btn-block" title="' + lang_download_as_png_desc + '">' + lang_download_as_png + '</button>';
                skp_dl_elem.addEventListener("click", function(){
                    skp_dl_elem.href = canvas.toDataURL();
                    skp_dl_elem.download = "skribbl_io.png";
                    if(dbg){console.log("downloading drawing");}
                });
                document.getElementsByClassName("tooltip-wrapper")[0].appendChild(skp_dl_elem);
            }
        });
    }

    if(feature_hard_mode){
        document.addEventListener("DOMContentLoaded", function() {
            if(!document.body.innerHTML.includes("skp_hard_mode_elem")){
                var skp_hard_mode_elem = document.createElement("a");
                skp_hard_mode_elem.id="skp_hard_mode_elem";
                skp_hard_mode_elem.style="text-decoration:none;";
                skp_hard_mode_elem.innerHTML='<div style="height:1vh;"></div><button class="btn btn-warning btn-block" title="' + lang_activate_hard_mode_desc + '">' + lang_activate_hard_mode + '</button>';
                skp_hard_mode_elem.addEventListener("click", function(){
                    if(confirm(lang_confirm_hard_mode)){
                        setInterval(function(){
                            document.getElementById("currentWord").innerHTML=lang_word_hint_disabled;
                            document.getElementById("boxMessages").innerHTML=lang_chat_disabled;
                            var msgs = document.getElementsByClassName("message");
                            for(var i = 0; i < msgs.length; i++){
                                msgs[i].innerHTML="";
                            }
                        },25);
                        if(dbg){console.log("activating hard mode");}
                    }
                    else {
                        if(dbg){console.log("cancelled hard mode confirmation");}
                    }
                });
                document.getElementsByClassName("tooltip-wrapper")[0].appendChild(skp_hard_mode_elem);
            }
        });
    }

    if(feature_watermark){
            running = parseBool(GM_getValue("running"));
        if(!document.body.innerHTML.includes("skp_watermark")){
            var watermark = document.createElement("div");
            watermark.innerHTML="skribbl.io+ v" + curversion + ' (<a href="https://github.com/Sv443/skribbl.io-plus" target="blank_" title="' + lang_opens_in_new_tab + '">GitHub</a>)';
            watermark.id="skp_watermark";
            watermark.align="center";
            watermark.style="color:white;font-size:1.25em;position:fixed;top:1vh;right:1vh;";
            document.getElementsByClassName("header")[0].appendChild(watermark);
            GM_addStyle(`html, body {margin: 0; height: 100%; overflow: hidden}`);
        }
    }


}, 100);



function parseBool(val) {
	return val === true || val === "true";
}
})();
