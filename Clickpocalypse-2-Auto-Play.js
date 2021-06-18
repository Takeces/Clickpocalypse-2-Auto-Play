// ==UserScript==
// @name         Clickpocalypse 2 Autoplay
// @namespace    Clickpocalypse2
// @version      1.1
// @description  Automatically plays Clickpocalypse 2
// @author       Takeces aka Akerus
// @match        https://minmaxia.com/c2/
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle('.addonButtonHolder {position: absolute; left:3px; bottom: 3px;}');
    GM_addStyle('.toggleAuto, .toggleAutoChar, .toggleMonsterLevel, .toggleKillUpgrades {margin-right: 1em; background-color: green;}');
    GM_addStyle('.paused {background-color: red;}');

    var active = false;
    var activeAutoChar = false;
    var activeMonsterLevel = false;
    var activeKillUpgrades = false;
    var encounter = false;
    var boss = false;
    var potInfiniteScrolls = false;
    var potAutoFire = false;

    function initialize() {
        var holder = document.getElementById('addonButtonHolder');
        if(holder == null) {
            holder = document.createElement('div');
            holder.setAttribute('id', 'addonButtonHolder');
            holder.setAttribute('class', 'addonButtonHolder');
            document.getElementsByClassName('mainTabContainer')[0].appendChild(holder);
        }
        var btn = document.createElement('button');
        btn.innerHTML = 'Activate Auto';
        btn.setAttribute('class', 'toggleAuto paused');
        btn.addEventListener('click', toggleAuto);
        holder.appendChild(btn);

        var btn2 = document.createElement('button');
        btn2.innerHTML = 'Activate Auto Char Progression';
        btn2.setAttribute('class', 'toggleAutoChar paused');
        btn2.addEventListener('click', toggleAutoChar);
        holder.appendChild(btn2);

        var btn3 = document.createElement('button');
        btn3.innerHTML = 'Activate Monster Level Progression';
        btn3.setAttribute('class', 'toggleMonsterLevel paused');
        btn3.addEventListener('click', toggleMonsterLevel);
        holder.appendChild(btn3);

        var btn4 = document.createElement('button');
        btn4.innerHTML = 'Activate Kill Upgrades';
        btn4.setAttribute('class', 'toggleKillUpgrades paused');
        btn4.addEventListener('click', toggleKillUpgrades);
        holder.appendChild(btn4);
    }

    function toggleAuto() {
        var toggleBtn = document.getElementsByClassName('toggleAuto')[0];
        toggleBtn.classList.toggle('paused');
        active = !active;
    }

    function toggleAutoChar() {
        var toggleBtn = document.getElementsByClassName('toggleAutoChar')[0];
        toggleBtn.classList.toggle('paused');
        activeAutoChar = !activeAutoChar;
    }

    function toggleMonsterLevel() {
        var toggleBtn = document.getElementsByClassName('toggleMonsterLevel')[0];
        toggleBtn.classList.toggle('paused');
        activeMonsterLevel = !activeMonsterLevel;
    }

    function toggleKillUpgrades() {
        var toggleBtn = document.getElementsByClassName('toggleKillUpgrades')[0];
        toggleBtn.classList.toggle('paused');
        activeKillUpgrades = !activeKillUpgrades;
    }

    function loop() {
        if(active) {
            getState();
            doLoot();
            doAvailableUpgrades();
            doCharacters();
            doPotions();
            doScrolls();
        }
        setTimeout(loop, 250);
    }

    function getState() {
        encounter = window.getComputedStyle(document.getElementById('encounterNotificationPanel')).display !== 'none';
        boss = document.getElementsByClassName('bossEncounterNotificationDiv').length > 0;
        getPotionStates();
    }

    function getPotionStates() {
        potAutoFire = false;
        potInfiniteScrolls = false;
        for(let btn of document.getElementsByClassName('potionButtonActive')) {
            var name = btn.getElementsByTagName('td')[1].innerText;
            if(name === 'Infinite Scrolls') { potInfiniteScrolls = true; }
            if(name === 'Scrolls Auto Fire') { potAutoFire = true; }
        }
    }

    function doLoot() {
        if(document.getElementsByClassName('lootButton').length < 1) { return; }
        var btn = document.getElementsByClassName('lootButton')[0];
        click(btn);
    }

    function doAvailableUpgrades() {
        for(let btn of document.getElementsByClassName('upgradeButton')) {
            if(btn.id == 'pauseButton') { continue; }
            if(btn.id.includes('characterSkillsContainer') || btn.id.includes('pointUpgradesContainer')) { continue; }
            if(window.getComputedStyle(btn).display === 'none') { continue; }
            if(btn.getElementsByTagName('table').length > 0) {
                if(btn.getElementsByTagName('tr')[0].innerText.includes('Level Up') ||
                   btn.getElementsByTagName('tr')[0].innerText.includes('Buy Monster Farm') ||
                   btn.getElementsByTagName('tr')[0].innerText.includes('Harvest Rewards') ||
                   btn.getElementsByTagName('tr')[0].innerText.includes('Collect Item Sales') ||
                   btn.getElementsByTagName('tr')[0].innerText.includes('Attack Castle') ||
                   btn.getElementsByTagName('tr')[0].innerText.includes('Retire Monster')) {
                    click(btn);
                    return;
                }
                var images = btn.getElementsByTagName('img');
                if(images.length > 0) {
                    for(var i = 0; i < images.length; i++) {
                        if(window.getComputedStyle(images[i]).background.includes('items.png')) {
                            click(btn);
                            return;
                        }
                    }
                }
                if(btn.getElementsByTagName('tr')[0].innerText.startsWith('Unlock Monster')) {
                    if(!activeMonsterLevel ||
                        btn.getElementsByTagName('tr')[1].innerText.includes('Assessment: TOO HARD!') ||
                        btn.getElementsByTagName('tr')[1].innerText.includes('Assessment: Very Tough!') ||
                        btn.getElementsByTagName('tr')[1].innerText.includes('Assessment: Challenging') ||
                        btn.getElementsByTagName('tr')[0].innerText.includes('Unlock Monster Level 36')) {
                        continue;
                    } else {
                        click(btn);
                        return;
                    }
                }
            } else {
                // remaining upgrades should be kill-upgrades
                if(activeKillUpgrades) {
                    click(btn);
                    return;
                }
            }
        }
    }

    function doCharacters() {
        if(!activeAutoChar) { return; }
        for(var charSlot = 0; charSlot < 5; charSlot++) {
            for(var col = 0; col < 4; col++) {
                for(var row = 0; row < 9; row++) {
                    var btn = document.getElementById('characterSkillsContainer'+charSlot+'_'+row+'_'+col+'_'+row);
                    if(btn === null) {
                        continue;
                    }
                    click(btn);
                }
            }
        }
    }

    function doPotions() {
        for(let pot of document.getElementsByClassName('potionButton')) {
            var btn = pot.parentElement;
            var name = pot.getElementsByTagName('td')[1].innerText;

            // don't do those together
            if(name === 'Infinite Scrolls' && potAutoFire) { continue; }
            if(name === 'Scrolls Auto Fire' && potInfiniteScrolls) { continue; }

            if(!encounter && (name === 'Infinite Scrolls' || name === 'Scrolls Auto Fire')) {
                continue;
            }
            click(btn);
            return;
        }
    }

    function doScrolls() {
        if(!encounter || potAutoFire) { return; }
        for(let btn of document.getElementsByClassName('scrollButton')) {
            var amount = btn.getElementsByTagName('td')[2].innerText.replaceAll('x','');
            if(amount == 0) { continue; }

            if(boss || amount == 'Infinite' || amount > 30) {
                click(btn);
            }
        }
    }

    function click(elem) {
        elem.onmouseup();
    }

    initialize();
    loop();
})();
