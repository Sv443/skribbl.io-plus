// ==UserScript==
// @name           skribbl.io+
// @name:de        skribbl.io+
// @version        1.0.0
// @description    Skribbl.io improvements
// @description:de Skribbl.io Verbesserungen
// @namespace      https://github.com/Sv443
// @author         Sv443
// @license        MIT
// @copyright      2018-2020, Sv443 (https://github.com/Sv443)
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
// @connect        self
// @connect        *
// @supportURL     https://github.com/Sv443/skribbl.io-plus/issues
// ==/UserScript==

const dbg = false; // enable javascript console debug (default: false, can be true or false)
const calculationsPerSecond = 20; // basically the framerate of the (re-)calculations

const version = GM_info.script.version;
const jsl = {
    isEmpty: val => {
        return ((val != null && typeof input == "object" && !isNaN(parseInt(val.length)) && val.length <= 0) // arrays
        || val === undefined || val === null || val === "") // other
        ? true : false;
    }
}
var hardModeEnabled = false;

// ReImg library https://github.com/gillyb/reimg
var ReImg={OutputProcessor:function(encodedData,svgElement){var isPng=function(){return encodedData.indexOf('data:image/png')===0};var downloadImage=function(data,filename){var a=document.createElement('a');a.href=data;a.download=filename;document.body.appendChild(a);a.click()};return{toBase64:function(){return encodedData},toImg:function(){var imgElement=document.createElement('img');imgElement.src=encodedData;return imgElement},toCanvas:function(callback){var canvas=document.createElement('canvas');var boundedRect=svgElement.getBoundingClientRect();canvas.width=boundedRect.width;canvas.height=boundedRect.height;var canvasCtx=canvas.getContext('2d');var img=this.toImg();img.onload=function(){canvasCtx.drawImage(img,0,0);callback(canvas)}},toPng:function(){if(isPng()){var img=document.createElement('img');img.src=encodedData;return img}
this.toCanvas(function(canvas){var img=document.createElement('img');img.src=canvas.toDataURL();return img})},toJpeg:function(quality){quality=quality||1.0;(function(q){this.toCanvas(function(canvas){var img=document.createElement('img');img.src=canvas.toDataURL('image/jpeg',q);return img})})(quality)},downloadPng:function(filename){filename=filename||'image.png';if(isPng()){downloadImage(encodedData,filename);return}
this.toCanvas(function(canvas){downloadImage(canvas.toDataURL(),filename)})}}},fromSvg:function(svgElement){var svgString=new XMLSerializer().serializeToString(svgElement);return new this.OutputProcessor('data:image/svg+xml;base64,'+window.btoa(svgString),svgElement)},fromCanvas:function(canvasElement){var dataUrl=canvasElement.toDataURL();return new this.OutputProcessor(dataUrl)}};if(typeof exports==='object'&&typeof module!==void 0){module.exports={ReImg:ReImg}}
else{window.ReImg=ReImg}

var URLhost = window.location.host;
var URLpath = window.location.pathname;
var curURL = URLhost + "" + URLpath;
var qStr = getQStrObj();

var feature_delete_messages = true;
var feature_download_png = true;
var feature_watermark = true;
var feature_hard_mode = true;



/* ---- Changelog ----    ---- Changelog ----    ---- Changelog ----    ---- Changelog ----    ---- Changelog ---- */

// [0.1]
//     - Added a button that enables the drawing to be downloaded
//     - Added a button to enable the hard mode which disables the hint at the top and the chat
//     - Added a button to each message that allows it to be deleted (client-side)
//
// [0.1.1]
//     - Fixed default settings
//
// [1.0.0]
//     - foo
//         -bar
//     - baz


const hardMode = {
    enable: () => {
        alert("Hard Mode - WIP");
    },
    disable: () => {
        alert("Disable Hard Mode - WIP");
    }
}

const reRender = {
    watermark: () => {
        let header = document.getElementsByClassName("header")[0];
        let watermark = document.getElementById("skp_watermark");

        if(header != null && GM_getValue("skp_watermark_enabled") == "true" && watermark == null && isInGame())
        {
            header.style.position = "relative";
            header.style.display = "block";

            let elem = document.createElement("div");
            elem.id = "skp_watermark";
            elem.style = "position: absolute; bottom: 0; right: 0; color: #fff; display: inline-block; text-align: right; font-size: 17px;";
            elem.innerHTML = `skribbl.io+ (v${version}) &bull; <a href="https://github.com/Sv443" target="_blank" title="Opens in a new Tab">Author</a> &bull; <a href="https://github.com/Sv443/skribbl.io-plus" target="_blank" title="Opens in a new Tab">GitHub</a>`;
            header.appendChild(elem);
        }
        else if(header != null && GM_getValue("skp_watermark_enabled") != "true" && watermark != null)
        {
            watermark.parentNode.removeChild(watermark);
        }

        let aboutwatermark = document.getElementById("skp_aboutwatermark");
        if(aboutwatermark == null)
        {
            let elem = document.createElement("div");
            elem.id = "skp_aboutwatermark";
            elem.innerHTML = `<br>You are running skribbl.io+ (v${version}) by <a href="https://github.com/Sv443" target="_blank">Sv443</a>`;
            document.getElementById("collapseAbout").appendChild(elem);
        }
    },
    buttons: () => {
        //#SECTION Download
        let downloadBtn = document.getElementById("skp_download");
        if(jsl.isEmpty(downloadBtn) && GM_getValue("skp_download_enabled") == "true")
        {
            let elem = document.createElement("button");
            elem.className = "btn btn-warning btn-block";
            elem.id = "skp_download";
            elem.innerHTML = "Download Drawing";
            elem.onclick = () => {
                downloadDrawing();
            }

            document.getElementsByClassName("tooltip-wrapper")[0].appendChild(elem);
        }
        else if(!jsl.isEmpty(downloadBtn) && GM_getValue("skp_download_enabled" != "true"))
        {
            downloadBtn.parentNode.removeChild(downloadBtn);
        }

        //#SECTION Hard Mode
        let hardmodeBtn = document.getElementById("skp_hardmode");
        if(jsl.isEmpty(hardmodeBtn) && GM_getValue("skp_hardmode_enabled") == "true")
        {
            let elem = document.createElement("button");
            elem.className = "btn btn-warning btn-block";
            elem.id = "skp_hardmode";
            elem.innerHTML = "Hard Mode";
            elem.onclick = () => {
                hardMode.enable();
            }

            document.getElementsByClassName("tooltip-wrapper")[0].appendChild(elem);
        }
        else if(!jsl.isEmpty(hardmodeBtn) && GM_getValue("skp_hardmode_enabled" != "true"))
        {
            hardmodeBtn.parentNode.removeChild(hardmodeBtn);
        }
    },
    menu: () => {
        let menuToggle = document.getElementById("skp_menutoggle");

        if(menuToggle == null)
        {
            let elem = document.createElement("img");
            elem.id = "skp_menutoggle";
            elem.src = "https://raw.githubusercontent.com/Sv443/skribbl.io-plus/master/images/expand_56x42.png";
            elem.style = "display: inline-block; cursor: pointer; position: absolute; top: 20px; right: 5px;"
            elem.title = "Open the skribbl.io+ Menu";
            elem.dataset.menuState = "0";
            elem.onclick = () => {
                toggleMenu();
            }

            document.body.appendChild(elem);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.info(`%cskribbl.io+ (v${version}) by Sv443 ( https://github.com/Sv443 ) - Licensed under the MIT license ( https://sv443.net/LICENSE )`, "padding: 3px; background-color: #333; color: #fff");

    //DEBUG
    GM_setValue("skp_watermark_enabled", "true");
    GM_setValue("skp_download_enabled", "true");
    GM_setValue("skp_hardmode_enabled", "true");
    GM_setValue("skp_hardmode", "true");
    // GM_setValue("skp_watermark_enabled", "false");

    loop();
    setInterval(loop, (1000 / calculationsPerSecond)); // I wish this could be done better but I couldn't decypher the game controller script

    slowLoop();
    setInterval(slowLoop, 1000);


    let observerTarget = document.querySelector("#currentWord");
    if(GM_getValue("skp_hardmode") == "true" && observerTarget != null)
    {
        observerTarget.innerHTML = "(No Hint - Hard mode is enabled)";
    }
    let observer = new MutationObserver((mutations) => {
        if(hardModeEnabled)
        {
            console.log("B*1"); // TODO: fix recursion
            mutations.forEach((mutation) => {
                if(mutation.type == "childList")
                {
                    observerTarget.innerHTML = "(No Hint - Hard mode is enabled)";
                }
            });
        }
    });
    let observerConfig = { attributes: true, childList: true, characterData: true };
    observer.observe(observerTarget, observerConfig);
});

function loop()
{
    reRender.watermark();
    reRender.buttons();
    reRender.menu();
}

function slowLoop()
{
    hardModeEnabled = GM_getValue("skp_hardmode");
}

function downloadDrawing()
{
    let downloadBtn = document.getElementById("skp_download");
    if(downloadBtn != null)
    {
        ReImg.fromCanvas(document.getElementById("canvasGame")).downloadPng("skribbl.io_drawing");
    }
}

function toggleMenu()
{
    alert("Menu - WIP");
}

function getQStrObj()
{
    let qstrObj = {};
    let rawQstr = window.location.href.split("?")[1];

    let qstrArr = [];
    if(!jsl.isEmpty(rawQstr) && rawQstr.includes("&"))
    {
        qstrArr = rawQstr.split("&");
    }
    else if(!jsl.isEmpty(rawQstr))
    {
        qstrArr = [rawQstr];
    }


    if(qstrArr.length > 0)
    {
        qstrArr.forEach(qstrEntry => {
            if(qstrEntry.includes("="))
            {
                let splitEntry = qstrEntry.split("=");
                qstrObj[decodeURIComponent(splitEntry[0])] = decodeURIComponent(splitEntry[1].toLowerCase());
            }
        });
    }
    else qstrObj = null;

    return qstrObj;
}

function isInGame()
{
    return document.getElementById("screenLogin").style.display == "none";
}
