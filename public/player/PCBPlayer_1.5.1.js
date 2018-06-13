Common = {
    createElement: function(name, id) {
        var ele = document.createElement(name);
        ele.setAttribute('id', id);
        return ele;
    },
    setParams: function (obj, params) {
        for (key in params) {
            obj.setAttribute(key, params[key]);
        }
    },
    toDateTime: function (totalSec) {
        var hours = Math.floor(parseInt( totalSec / 3600 ) % 24);
        var minutes = Math.floor(parseInt( totalSec / 60 ) % 60);
        var seconds = Math.floor(totalSec % 60);
        var result = (hours < 10 ? "0" + hours : hours) + " : " + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
        return (result.indexOf('NaN') == -1) ? result : '00:00:00';
    },
    evalClock: function (h, m, s) {
        setInterval( function() {
            var seconds = new Date().getSeconds();
            s.innerText = (( seconds < 10 ? "0" : "" ) + seconds);
        },1000);

        setInterval( function() {
            var minutes = new Date().getMinutes();
            m.innerText = (( minutes < 10 ? "0" : "" ) + minutes);
        },1000);

        setInterval( function() {
            var hours = new Date().getHours();
            h.innerText = (( hours < 10 ? "0" : "" ) + hours);
        }, 1000);
    },
    getURLWithOutParameter: function () {
        return location.href.split('?')[0];
    },
    getURLParameter: function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||'0';
    },
    findOneChildByClass: function(parent, classValue) {
        for (var i = 0; i < parent.childNodes.length; i ++) {
            var item = parent.childNodes[i];
            var classAttr = item.getAttribute('class');
            if (classAttr != null && classAttr.indexOf(classValue) != -1) {
                return item;
            }
        }
    },
    findChildByIndex: function(parent, index) {
        return parent.childNodes[index];
    },
    changeAllURLParam: function(urlParam) {
        var currentURL = window.location.href;
        var oldParam = currentURL.split('?');
        if(oldParam.length > 1) {
            oldParam = oldParam[1];
        }
        if (typeof (history.pushState) != "undefined") {
            var obj = { oldParam: oldParam, urlParam: urlParam };
            history.pushState(obj, obj.oldParam, obj.urlParam);
        } else {
            alert("Browser does not support HTML5.");
        }
    },
    openLink: function() {
        var linkInfo = location.href.split('?');
        var newParams = '?g=' + currentGroupIndex  +  '&q=' + currentQualityIndex;
        var newLink = linkInfo[0] + newParams;
        location.href = newLink;
    },
    cumulativeOffset:function(element) {
        var top = 0, left = 0;
        do {
            top += element.offsetTop  || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element);

        return {
            top: top,
            left: left,

        };
    },
    changeValueUrlParams: function (url, urlParams) {
        var currentURLInfo = url.split('?');
        var urlNoParam = currentURLInfo[0];
        var oldParamsArr = (currentURLInfo.length > 1) ? currentURLInfo[1].split('&') : [];
        var newParamsUrl = [];
        var newParamsName = [];
        for (var i = 0; i < urlParams.length; i++) {
            newParamsUrl.push(urlParams[i].name + '=' + urlParams[i].value);
            newParamsName.push(urlParams[i].name);
        }

        for (var i = 0; i < oldParamsArr.length; i++) {
            if (newParamsName.indexOf(oldParamsArr[i].split('=')[0]) == -1) {
                newParamsUrl.push(oldParamsArr[i]);
            }
        }
        var newUrl = urlNoParam + '?' + newParamsUrl.join('&');
        return newUrl;
    },
    pushToUrl: function(url) {
        if (typeof (history.pushState) != "undefined") {
            history.pushState(null, null, url);
        } else {
            alert("Browser does not support HTML5.");
        }
    },
    convertToAlias: function(str){
        if ((str == null || typeof  str === 'undefined') ) return "";
        str= str.toLowerCase();
        str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
        str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
        str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
        str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
        str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
        str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
        str= str.replace(/đ/g,"d");
        str= str.replace(/!|@|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\"|\&|\#|\[|\]|~|_/g,"-");
        str= str.replace(/-+-/g,"-");
        str= str.replace(/^\-+|\-+$/g,"");
        return str;
    }
};

// global variables
var autoPlayCheck;
var movieInfo;
var currentEpisodeName;
var currentEpisodeIndex = Common.getURLParameter('e');
var currentGroupIndex = parseInt(Common.getURLParameter('g'));
var currentSourceIndex = parseInt(Common.getURLParameter('s'));
var currentQualityIndex = parseInt(Common.getURLParameter('q'));
var startTime = parseInt(Common.getURLParameter('st'));
var episodes;
var playListContent;
var currentTime;
var injectPlaylistHolder;
var initPlayerByUrl;



var Holders = {
    messageHolder: Common.createElement('div', 'message-holder'),
    waitingHolder: Common.createElement('div', 'waiting-holder'),
    videoHolder: Common.createElement('div', 'video-holder'),

    topHolder: Common.createElement('div', 'top-holder'),
    titleHolder: Common.createElement('div', 'title-holder'),

    mainHolder: Common.createElement('div', 'main-holder'),
    playlistHolder: Common.createElement('div', 'playlist-holder'),
    middleHolder: Common.createElement('div', 'middle-holder'),
    bigButtonHolder: Common.createElement('div', 'big-button-holder'),
    bottomHolder: Common.createElement('div', 'bottom-holder'),
    topInsideBottomHolder: Common.createElement('div', 'top-inside-bottom-holder'),
    leftTopInsideBottomHolder: Common.createElement('div', 'left-top-inside-bottom-holder'),
    centerTopInsideBottomHolder: Common.createElement('div', 'center-top-inside-bottom-holder'),
    rightTopInsideBottomHolder: Common.createElement('div', 'right-top-inside-bottom-holder'),


    bottomInsideBottomHolder: Common.createElement('div', 'bottom-inside-bottom-holder'),
    leftBottomInsideBottomHolder: Common.createElement('div', 'left-bottom-inside-bottom-holder'),

    centerBottomInsideBottomHolder: Common.createElement('div', 'center-bottom-inside-bottom-holder'),
    topCenterBottomInsideBottomHolder: Common.createElement('div', 'top-center-bottom-inside-bottom-holder'),
    nextPrevHolder: Common.createElement('div', 'next-prev-holder'),
    muteUnMuteProgressHolder: Common.createElement('div', 'mute-unMute-progress-holder'),
    muteUnMuteBtHolder: Common.createElement('div', 'mute-unMute-bt-holder'),
    settingBtHolder: Common.createElement('div', 'setting-bt-holder'),

    durationTimerHolder: Common.createElement('div', 'duration-timer-holder'),

    bottomCenterBottomInsideBottomHolder: Common.createElement('div', 'bottom-center-bottom-inside-bottom-holder'),
    progressBarHolder: Common.createElement('div', 'progress-bar-holder'),

    rightBottomInsideBottomHolder: Common.createElement('div', 'right-bottom-inside-bottom-holder'),
    posterHolder: Common.createElement('div', 'poster-holder'),
}

function supervisor() {
    setInterval( function() {
        //
        if(Controls.video.paused) {
            Common.setParams(Controls.playBt, {style:"display:block"});
            Common.setParams(Controls.pauseBt, {style:"display:none"});

            Common.setParams(Controls.bigPlayBt, {style:"display:block"});
        } else {
            Common.setParams(Controls.playBt, {style:"display:none"});
            Common.setParams(Controls.pauseBt, {style:"display:block"});

            Common.setParams(Controls.bigPlayBt, {style:"display:none"});
        }
        //
        Holders.mainHolder.setAttribute('class', 'fullscreen-' + screenfull.isFullscreen);
        if(screenfull.isFullscreen) {
            Common.setParams(Controls.unFullScreenBt, {style:"display:block"});
            Common.setParams(Controls.fullScreenBt, {style:"display:none"});
        } else {
            Common.setParams(Controls.unFullScreenBt, {style:"display:none"});
            Common.setParams(Controls.fullScreenBt, {style:"display:block"});
        }
        //
        Controls.durationTimer.durationCurrentTime.innerText = Common.toDateTime(Controls.video.currentTime);
        Controls.durationTimer.durationTotalTime.innerText = Common.toDateTime(Controls.video.duration);
        //
        if (Controls.sound.newPos <= 0) {
            setVolume(0);
            Common.setParams( Controls.sound.scrollBar.scrollLeft, {style: 'width:0px'});
            Common.setParams(Controls.sound.muteBt, {style: 'display: block'});
            Common.setParams(Controls.sound.unMuteBt, {style: 'display: none'});
        } else {
            setVolume(Controls.sound.percentProcessBar);
            Common.setParams( Controls.sound.scrollBar.scrollLeft, {style: 'width: ' + Controls.sound.newPos + 'px'});
            Common.setParams(Controls.sound.muteBt, {style: 'display: none'});
            Common.setParams(Controls.sound.unMuteBt, {style: 'display: block'});
        }
    }, 1);
}


var isPaused = false;
function togglePlay() {
    if(Controls.video.paused) {
        Controls.video.play();
        isPaused = false;
    } else {
        Controls.video.pause();
        isPaused = true;
    }
}

function onError(e) {
    console.log(e.message);
}

function toggleFullScreen() {
    screenfull.toggle(Holders.mainHolder);
}

function setVolume(val) {
    if (val > 1) val = 1;
    Controls.video.volume = val;
}

function toggleVisibleEvent() {
    var visibleTimeCount = 0;
    var videoOutside = true;
    Holders.mainHolder.addEventListener("mousemove", function(e) {
        visibleTimeCount = 0;
        videoOutside = false;
    });

    Holders.mainHolder.addEventListener("mouseout", function(e) {
        videoOutside = true;
    });

    setInterval( function() {
        if (Controls.video.paused) {
            return;
        }
        if(videoOutside) {
            Common.setParams(Holders.middleHolder, {style: 'opacity: 0'});
            visibleTimeCount = 0;
        } else {
            visibleTimeCount ++;
            if (visibleTimeCount <= 1) {
                Common.setParams(Holders.middleHolder, {style: 'opacity: 1'});
            } else if (visibleTimeCount > 500) {
                Common.setParams(Holders.middleHolder, {style: 'opacity: 0'});
            }
        }
    },1);
}

function initEvent() {
    Holders.leftBottomInsideBottomHolder.addEventListener("click", togglePlay);
    Controls.video.addEventListener('error', onError, true);
    Controls.video.addEventListener("click", togglePlay);
    Holders.bigButtonHolder.addEventListener("click", togglePlay);

    Holders.rightBottomInsideBottomHolder.addEventListener("click", toggleFullScreen);
    document.addEventListener('keydown', function(e) {
            switch (e.keyCode) {
                case 13: // ENTER. ESC should also take you out of fullscreen by default.
                    e.preventDefault();
                    screenfull.exit();
                    break;
                /*case 70: // f
                 screenfull.request(Holders.mainHolder);
                 break;*/
            }
        },
        false);
    //Controls.video.addEventListener("ondblclick", toggleFullScreen);
    Controls.progressBar.addEvents();
    Controls.sound.addEvents();
    Controls.setting.addEvents();
    toggleVisibleEvent();

    Controls.video.onloadeddata = function() {
        supervisor();
        hideWaiting();
        if (!isPaused) {
            Controls.video.play();
        }
        seekToTime(startTime); // seek to startTime that it is got from url
        checkSeekToCurrentTime(); // seek to time from cookies
    };

    Controls.video.ontimeupdate = function() {
        currentTime = Controls.video.currentTime;
        setTimeWatched(currentTime);
    };
}

var Controls = {
    videoIframe: Common.createElement('iframe', 'video-iframe'),
    video: initPCBPlayer(),
    logo: initLogo('phimcuaban.com'),
    errorMessage: Common.createElement('div', 'error-message'),
    waiting: initWaiting(),
    title: {
        firstName: Common.createElement('h3', 'first-name'),
        secondName: Common.createElement('h4', 'second-name')
    },
    playlist: {
        firstName: Common.createElement('h3', 'first-name'),
        secondName: Common.createElement('h4', 'second-name'),
        stateLabel: Common.createElement('span', 'state-label'),
        current: Common.createElement('span', 'current'),
        divideChar: Common.createElement('span', 'divide-char'),
        total: Common.createElement('span', 'total'),
        elements: Common.createElement('ul', 'playlist-elements')
    },
    confirmDialog: initConfirmDialog(),
    clock: initClock(),
    bigPlayBt: initBigPlayBt(),
    playBt: initPlayBt(),
    pauseBt: initPauseBt(),
    nextBt: initNextBt(),
    prevBt: initPrevBt(),
    fullScreenBt: initFullScreenBt(),
    unFullScreenBt: initUnFullScreenBt(),
    mouseDownOnCubeSoundBar: false,
    sound: {
        muteBt: initMuteBt(),
        unMuteBt: initUnMuteBt(),
        percentProcessBar: 0,
        newPos: 45,
        newPosTemp: 0,
        isMuted: false,
        scrollBar: {
            scrollLeft: Common.createElement('div', 'scroll-left'),
            scrollCue: Common.createElement('div', 'scroll-cue'),
            scrollRight: Common.createElement('div', 'scroll-right')
        },
        addEvents: function () {
            Controls.sound.percentProcessBar = Controls.sound.scrollBar.scrollLeft.offsetWidth / Controls.sound.scrollBar.scrollRight.offsetWidth;
            Holders.muteUnMuteBtHolder.addEventListener("click", function() {
                Controls.sound.isMuted = !Controls.sound.isMuted;
                if (Controls.sound.isMuted) {
                    Controls.sound.newPosTemp = Controls.sound.newPos;
                    Controls.sound.newPos = 0;
                } else {
                    Controls.sound.newPos = Controls.sound.newPosTemp;
                }
            });
            Controls.sound.scrollBar.scrollRight.addEventListener("click", function(e) {
                Controls.sound.newPos = e.clientX - Common.cumulativeOffset(Controls.sound.scrollBar.scrollRight).left;
                Controls.sound.percentProcessBar = (Controls.sound.newPos / this.offsetWidth);
            });
            var mouseDownOnCubeSoundBar = false;
            Controls.sound.scrollBar.scrollCue.addEventListener("mousedown", function(e) {
                mouseDownOnCubeSoundBar = true;
            });
            Holders.videoHolder.addEventListener("mouseup", function(e) {
                mouseDownOnCubeSoundBar = false;
            });
            Holders.videoHolder.addEventListener("mousout", function(e) {
                mouseDownOnCubeSoundBar = false;
            });
            Holders.videoHolder.addEventListener("mousemove", function(e) {
                var temp = e.clientX - Common.cumulativeOffset(Controls.sound.scrollBar.scrollRight).left;
                if (!mouseDownOnCubeSoundBar  || temp > (Controls.sound.scrollBar.scrollRight.offsetWidth)) return false;
                Controls.sound.newPos = temp;
                Controls.sound.percentProcessBar = (Controls.sound.newPos / this.offsetWidth);
            });
        }
    },
    progressBar: {
        scrollLeft: Common.createElement('div', 'scroll-left'),
        scrollCue: Common.createElement('div', 'scroll-cue'),
        scrollRight: Common.createElement('div', 'scroll-right'),
        mouseMoveTime: Common.createElement('div', 'mouse-move-time'),
        addEvents: function () {
            Controls.video.addEventListener('progress', function(e) {
               /* console.log(this.buffered.end(0));
                var loadedPercentage = (this.buffered.end(0) / this.duration) * Holders.progressBarHolder.offsetWidth;
                Common.setParams(Controls.progressBar.scrollRight, {style: 'width: ' + loadedPercentage + 'px'})*/
            });

            Controls.video.addEventListener('timeupdate', function(e) {
                var updatePercentage = (this.currentTime / this.duration) * Holders.progressBarHolder.offsetWidth;
                Common.setParams(Controls.progressBar.scrollLeft, {style: 'width: ' + updatePercentage + 'px'});
            });

            Holders.progressBarHolder.addEventListener("click", function(e) {
                var newPos = e.clientX - Common.cumulativeOffset(Holders.progressBarHolder).left;
                Common.setParams(Controls.progressBar.scrollLeft, {style: 'width: ' + newPos + 'px'});
                seekToTime((newPos / Holders.progressBarHolder.offsetWidth) * Controls.video.duration);
            });

            var mouseDownOnCubeProgressBar = false;
            Controls.progressBar.scrollCue.addEventListener("mousedown", function(e) {
                mouseDownOnCubeProgressBar = true;
            });
            Holders.videoHolder.addEventListener("mouseup", function(e) {
                mouseDownOnCubeProgressBar = false;
            });
            Holders.videoHolder.addEventListener("mousout", function(e) {
                mouseDownOnCubeProgressBar = false;
            });

            Holders.videoHolder.addEventListener("mousemove", function(e) {

                var newPos = e.clientX - Common.cumulativeOffset(Holders.progressBarHolder).left;
                if (newPos < 0 || newPos > Holders.progressBarHolder.offsetWidth) return false;
                var mouseOverTime = Common.toDateTime((newPos / Holders.progressBarHolder.offsetWidth) * Controls.video.duration);
                Controls.progressBar.mouseMoveTime.innerText = mouseOverTime;
                if (mouseDownOnCubeProgressBar){
                    Common.setParams(Controls.progressBar.scrollLeft, {style: 'width: ' + newPos + 'px'});
                    seekToTime((newPos / Holders.progressBarHolder.offsetWidth) * Controls.video.duration);
                }
            });

            Holders.progressBarHolder.addEventListener("mouseover", function(e) {
                Common.setParams(Controls.progressBar.mouseMoveTime, {style: 'opacity: 1'});
            });

            Holders.progressBarHolder.addEventListener("mouseout", function(e) {
                Common.setParams(Controls.progressBar.mouseMoveTime, {style: 'opacity: 0'});
            });


        }
    },
    durationTimer: {
        durationCurrentTime: Common.createElement('div', 'duration-current-time'),
        durationTimerPoint: Common.createElement('div', 'duration-timer-point'),
        durationTotalTime: Common.createElement('div', 'duration-total-time')
    },
    setting: {
        settingBt: initSettingBt(),
        settingContainer: Common.createElement('div', 'setting-container'),
        qualities: {
            qualityContainer: Common.createElement('div', 'quality-container')
        },
        groups: {
            groupContainer: Common.createElement('div', 'group-container')
        },
        addEvents: function () {
            var settingContainerVisible = false;
            Controls.setting.settingBt.addEventListener('click', function(e) {
                settingContainerVisible = !settingContainerVisible;
                Common.setParams(Controls.setting.settingContainer, {style: 'bottom: ' + (settingContainerVisible ? '140' : '100000')  + 'px'})
            });
        }
    }
};

function PCBPlayer(selector, injectPlaylistHolderSelector, params, initPlayerByUrlCallBack, callback) {
    initGlobalVars(selector, injectPlaylistHolderSelector, params, initPlayerByUrlCallBack);
    initHolders(selector);
    populateControlsToHolders();
    initEvent();
    callback(Controls.video);
}

function initGlobalVars(selector, injectPlaylistHolderSelector, params, initPlayerByUrlCallBack) {
    movieInfo = params;
    currentEpisodeIndex = Common.getURLParameter('e');
    currentGroupIndex = parseInt(Common.getURLParameter('g'));
    currentQualityIndex = parseInt(Common.getURLParameter('q'));
    currentPosition = parseInt(Common.getURLParameter('p'));
    initPlayerByUrl = initPlayerByUrlCallBack;
    injectPlaylistHolder = document.getElementById(injectPlaylistHolderSelector);
    injectPlaylistHolder.innerHTML = '';
    Common.setParams(Controls.video, {class: 'PCBPlayer ' + selector});
    setTitle(movieInfo.firstName, movieInfo.secondName);
    // check and load playlist first
    episodes = getEpisodes();
}
function populatePlayList(){
    Holders.playlistHolder.innerHTML = '';
    if (episodes.length > 1) {
        Common.setParams(injectPlaylistHolder, {class: 'inject-playlist-holder'});
        Holders.mainHolder.appendChild(Holders.playlistHolder);

        var playListContainer = Common.createElement('div', 'play-list-container');
        Holders.playlistHolder.appendChild(playListContainer);

        var playListHeader = Common.createElement('div', 'play-list-header');
        playListContainer.appendChild(playListHeader);

        var playListInfo = Common.createElement('div', 'play-list-info');
        playListHeader.appendChild(playListInfo);

        var playListInfoIconHolder = Common.createElement('div', 'play-list-info-icon-holder');
        var playListInfoIcon = Common.createElement('i', 'play-list-info-icon');
        Common.setParams(playListInfoIcon, {class:'glyphicon glyphicon-list'});
        playListInfoIconHolder.appendChild(playListInfoIcon);
        playListInfo.appendChild(playListInfoIconHolder);

        var playListInfoTitleAndState = Common.createElement('div', 'play-list-info-title-and-state');
        playListInfo.appendChild(playListInfoTitleAndState);

        var playListInfoTitle = Common.createElement('h3', 'play-list-title');

        Controls.playlist.firstName.innerText = movieInfo.firstName;
        Controls.playlist.secondName.innerText = movieInfo.secondName;
        var titleHeader = (Controls.playlist.firstName.innerText + ' | ' + Controls.playlist.secondName.innerText);
        playListInfoTitle.innerText = titleHeader;
        playListInfoTitleAndState.appendChild(playListInfoTitle);

        var currentTotalEpisodeHolder = Common.createElement('div', 'current-total-episode-holder');
        currentTotalEpisodeHolder.appendChild(Controls.playlist.stateLabel);
        Controls.playlist.stateLabel.innerText = "Bạn đang xem ";
        currentTotalEpisodeHolder.appendChild(Controls.playlist.current);
        currentTotalEpisodeHolder.appendChild(Controls.playlist.divideChar);
        Controls.playlist.divideChar.innerText = " / ";
        currentTotalEpisodeHolder.appendChild(Controls.playlist.total);
        playListInfoTitleAndState.appendChild(currentTotalEpisodeHolder);

        playListControlBar = Common.createElement('div', 'play-list-control-bar');
        autoPlayCheck = Common.createElement('input', 'auto-play-check');
        autoPlayCheck.setAttribute('type', 'checkbox');
        autoPlayCheck.setAttribute('checked', 'checked');
        playListControlBar.appendChild(autoPlayCheck);

        var autoPlayCheckLabel = Common.createElement('label', 'auto-play-check-label');
        playListControlBar.appendChild(autoPlayCheckLabel);
        autoPlayCheckLabel.setAttribute('for', 'auto-play-check');

        var autoPlayCheckP = Common.createElement('p', 'auto-play-check-p');
        autoPlayCheckP.innerText = 'Tự chuyển tập';
        playListControlBar.appendChild(autoPlayCheckP);

        Holders.playlistHolder.appendChild(playListControlBar);

        playListContent = Common.createElement('ul', 'play-list-content');
        Holders.playlistHolder.appendChild(playListContent);

        currentEpisodeName = episodes[currentEpisodeIndex];
        Controls.playlist.current.innerText = currentEpisodeName;
        Controls.playlist.total.innerText = episodes.length;
        // populate playlist
        for (var i=0; i < episodes.length; i++) {
            var episodeItem = Common.createElement('li', 'episode-item');
            var episodeItemIndex = Common.createElement('a', 'episode-item-index');
            episodeItem.appendChild(episodeItemIndex);
            var episodeItemTitle = Common.createElement('div', 'episode-item-title');

            episodeItem.setAttribute('episode-name', episodes[i]);
            episodeItemIndex.innerText = episodes[i];
            episodeItemTitle.innerText = titleHeader;
            if(i == currentEpisodeIndex) {
                episodeItem.setAttribute('class', 'episode-active');
            }
            episodeItemIndex.setAttribute('href', Common.changeValueUrlParams(location.href, [{name:'g', value:currentGroupIndex}, {name:'e', value: i}, {name:'q', value:currentQualityIndex},]));
            /*episodeItem.setAttribute('data-href', Common.changeValueUrlParams(movieInfo.url, [{name:'en', value: Common.convertToAlias(episodes[i])}]));
            episodeItem.setAttribute('href', Common.changeValueUrlParams(location.href, [{name:'en', value:Common.convertToAlias(episodes[i])}]));
            episodeItem.addEventListener('click', function(e) {
                e.preventDefault();
                if (this.getAttribute('class') != 'episode-active') {
                    Common.pushToUrl(this.getAttribute('href'));
                    initPlayerByUrl(this.getAttribute('data-href'));
                }
            });*/
            playListContent.appendChild(episodeItem);
        }
    }
}

function populateQualities(){
    var qualities = getQualities();
    Controls.setting.qualities.qualityContainer.innerText = '';
    for (var i = 0; i < qualities.length; i++) {
        var qualityItem = initQualityBt(qualities[i].label);
        Controls.setting.qualities.qualityContainer.appendChild(qualityItem);
        if (i == currentQualityIndex) {
            Common.setParams(qualityItem, {class: 'quality-active'});
        }
        qualityItem.setAttribute('href', Common.changeValueUrlParams(location.href, [{name:'g', value:currentGroupIndex}, {name:'e', value:currentEpisodeIndex}, {name:'q', value:i}]));
        //qualityItem.setAttribute('data-href', Common.changeValueUrlParams(movieInfo.url, [{name:'q', value:i}]));
        /*qualityItem.addEventListener('click', function(e) {
            e.preventDefault();
            Common.pushToUrl(this.getAttribute('href'));
            initPlayerByUrl(this.getAttribute('data-href'));
        });*/
    }
}

function populateGroups(){
    var groups = getGroups();
    if (groups.length > 1) {
        Controls.setting.groups.groupContainer.innerText = '';
        for (var i = 0; i < groups.length; i++) {
            var groupName = groups[i];
            if (groupName.toLowerCase().indexOf('minh') != -1) groupName = 'Thuyết Minh';
            else if (groupName.toLowerCase().indexOf('sub') != -1) groupName = 'Phụ Đề';
            var groupItem = initGroupBt(groupName);
            Controls.setting.groups.groupContainer.appendChild(groupItem);
            if (i == currentGroupIndex) {
                Common.setParams(groupItem, {class: 'group-active'});
            }
            groupItem.setAttribute('href', Common.changeValueUrlParams(location.href, [{name:'g', value:i}, {name:'e', value:currentEpisodeIndex}, {name:'q', value:currentQualityIndex}]));
            //groupItem.setAttribute('data-href', Common.changeValueUrlParams(movieInfo.url, [{name:'g', value:i}]));
            /*groupItem.addEventListener('click', function(e) {
                e.preventDefault();
                Common.pushToUrl(this.getAttribute('href'));
                initPlayerByUrl(this.getAttribute('data-href'));
            });*/
        }
    }
}

function showWaiting() {
    Common.setParams(Holders.waitingHolder, {style:"display:inline-flex"});
    Common.setParams(Holders.messageHolder, { style: 'display:none' });
}

function hideWaiting() {
    Common.setParams(Holders.waitingHolder, {style:"display:none"});
}

function initHolders(selector) {
    var container = document.getElementById(selector);
    container.innerHTML = '';
    container.setAttribute("class", (movieInfo.episodes.length > 1) ? "multiple-episode" : "one-episode");
    container.appendChild(Holders.mainHolder);
    Holders.mainHolder.appendChild(Holders.videoHolder);
    Holders.videoHolder.appendChild(Controls.logo);
    Holders.videoHolder.appendChild(Holders.middleHolder);

    Holders.videoHolder.appendChild(Holders.waitingHolder);
    Holders.videoHolder.appendChild(Holders.messageHolder);

    Holders.middleHolder.appendChild(Holders.topHolder);
    Holders.topHolder.appendChild(Holders.titleHolder);

    Holders.middleHolder.appendChild(Holders.bigButtonHolder);

    Holders.middleHolder.appendChild(Holders.bottomHolder);

    Holders.bottomHolder.appendChild(Holders.topInsideBottomHolder);
    Holders.topInsideBottomHolder.appendChild(Holders.leftTopInsideBottomHolder);

    Holders.topInsideBottomHolder.appendChild(Holders.centerTopInsideBottomHolder);
    Holders.topInsideBottomHolder.appendChild(Holders.rightTopInsideBottomHolder);
    Holders.rightTopInsideBottomHolder.appendChild(Holders.durationTimerHolder);

    Holders.bottomHolder.appendChild(Holders.bottomInsideBottomHolder);
    Holders.bottomInsideBottomHolder.appendChild(Holders.leftBottomInsideBottomHolder);

    Holders.bottomInsideBottomHolder.appendChild(Holders.centerBottomInsideBottomHolder);
    Holders.centerBottomInsideBottomHolder.appendChild(Holders.topCenterBottomInsideBottomHolder);

    Holders.topCenterBottomInsideBottomHolder.appendChild(Holders.nextPrevHolder);
    Holders.topCenterBottomInsideBottomHolder.appendChild(Holders.muteUnMuteProgressHolder);

    Holders.topCenterBottomInsideBottomHolder.appendChild(Holders.settingBtHolder);

    Holders.centerBottomInsideBottomHolder.appendChild(Holders.bottomCenterBottomInsideBottomHolder);
    Holders.bottomCenterBottomInsideBottomHolder.appendChild(Holders.progressBarHolder);

    Holders.bottomInsideBottomHolder.appendChild(Holders.rightBottomInsideBottomHolder);

}

function populateControlsToHolders() {

    Holders.waitingHolder.appendChild(Controls.waiting);

    //Holders.messageHolder.appendChild(Controls.errorMessage);

    Holders.centerTopInsideBottomHolder.appendChild(Controls.progressBar.mouseMoveTime);

    Holders.muteUnMuteProgressHolder.appendChild(Holders.muteUnMuteBtHolder);
    Holders.muteUnMuteBtHolder.appendChild(Controls.sound.muteBt);
    Holders.muteUnMuteBtHolder.appendChild(Controls.sound.unMuteBt);
    Holders.muteUnMuteProgressHolder.appendChild(Controls.sound.scrollBar.scrollRight);
    Controls.sound.scrollBar.scrollRight.appendChild(Controls.sound.scrollBar.scrollLeft);
    Controls.sound.scrollBar.scrollLeft.appendChild(Controls.sound.scrollBar.scrollCue);

    Holders.settingBtHolder.appendChild(Controls.setting.settingBt);
    Holders.topInsideBottomHolder.appendChild(Controls.setting.settingContainer);
    Controls.setting.settingContainer.appendChild(Controls.setting.groups.groupContainer);
    Controls.setting.settingContainer.appendChild(Controls.setting.qualities.qualityContainer);

    Holders.bigButtonHolder.appendChild(Controls.bigPlayBt);

    Holders.messageHolder.appendChild(Controls.confirmDialog);

    Holders.leftTopInsideBottomHolder.appendChild(Controls.clock);

    Holders.durationTimerHolder.appendChild(Controls.durationTimer.durationCurrentTime);
    Controls.durationTimer.durationCurrentTime.innerText = '00:00:00';
    Controls.durationTimer.durationTimerPoint.innerText = ' | ';
    Controls.durationTimer.durationTotalTime.innerText = '00:00:00';
    Holders.durationTimerHolder.appendChild(Controls.durationTimer.durationTimerPoint);
    Holders.durationTimerHolder.appendChild(Controls.durationTimer.durationTotalTime);

    Holders.leftBottomInsideBottomHolder.appendChild(Controls.playBt);
    Holders.leftBottomInsideBottomHolder.appendChild(Controls.pauseBt);

    Holders.rightBottomInsideBottomHolder.appendChild(Controls.fullScreenBt);
    Holders.rightBottomInsideBottomHolder.appendChild(Controls.unFullScreenBt);

    Holders.nextPrevHolder.appendChild(Controls.prevBt);
    Holders.nextPrevHolder.appendChild(Controls.nextBt);

    Holders.titleHolder.appendChild(Controls.title.firstName);
    Holders.titleHolder.appendChild(Controls.title.secondName);

    Holders.progressBarHolder.appendChild(Controls.progressBar.scrollRight);
    Controls.progressBar.scrollRight.appendChild(Controls.progressBar.scrollLeft);
    Controls.progressBar.scrollLeft.appendChild(Controls.progressBar.scrollCue);

    Holders.videoHolder.appendChild(Controls.video);
    populatePlayList();
    populateGroups();
    populateQualities()

    // auto next episode event handle
    Controls.video.onended = function(e) {
        setTimeWatched(0);
        if(currentEpisodeIndex < (episodes.length - 1) && (autoPlayCheck.checked)) {
            playNextEpisode();
        }
    }
}

function initClock() {
    var $this = Common.createElement('div', 'clock-systime');
    var ulTimer = Common.createElement('ul', 'ul-clock-systime');
    var point = Common.createElement('li', 'point');
    point.innerText = ':';
    var liIconHolder = Common.createElement('li', 'li-icon-holder');
    var icon = Common.createElement('span', 'clock-systime-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-time'});
    liIconHolder.appendChild(icon);
    ulTimer.appendChild(liIconHolder);

    var hours = Common.createElement('li', 'hours');
    hours.innerText = '00';
    ulTimer.appendChild(hours);
    ulTimer.appendChild(point);

    var min = Common.createElement('li', 'min');
    min.innerText = '00';
    ulTimer.appendChild(min);
    ulTimer.appendChild(point.cloneNode(true));

    var sec = Common.createElement('li', 'sec');
    sec.innerText = '00';
    ulTimer.appendChild(sec);
    $this.appendChild(ulTimer);

    Common.evalClock(hours, min, sec);
    return $this;
}

function initPCBPlayer() {
    var $this = Common.createElement('video', 'PCBPlayer');
    return $this;
}

function initLogo(label) {
    var $this = Common.createElement('div', 'logo');
    $this.innerText = label;
    return $this;
}
function initWaiting() {
    var $this = Common.createElement('div', 'waiting-icon');
    return $this;
}
function initQualityBt(label) {
    var $this = Common.createElement('a', label);
    Common.setParams($this, {class: 'quality-bt'});
    $this.innerText = label;
    return $this;
}
function initGroupBt(label) {
    var $this = Common.createElement('a', label);
    Common.setParams($this, {class: 'group-bt'});
    $this.innerText = label;
    return $this;
}
function initBigPlayBt() {
    var $this = Common.createElement('div', 'big-play-bt');
    var icon = Common.createElement('span', 'big-play-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-play'});
    $this.appendChild(icon);
    return $this;
}


function initSettingBt() {
    var $this = Common.createElement('div', 'setting-bt');
    var icon = Common.createElement('span', 'setting-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-cog'});
    $this.appendChild(icon);
    return $this;
}

function initPlayBt() {
    var $this = Common.createElement('div', 'play-bt');
    var icon = Common.createElement('span', 'play-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-play'});
    $this.appendChild(icon);
    return $this;
}

function initPauseBt() {
    var $this = Common.createElement('div', 'pause-bt');
    Common.setParams($this, {style: 'display:none'});
    var icon = Common.createElement('span', 'pause-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-pause'});
    $this.appendChild(icon);
    return $this;
}

function initNextBt() {
    var $this = Common.createElement('div', 'next-bt');
    var icon = Common.createElement('span', 'next-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-fast-forward'});
    $this.appendChild(icon);
    $this.addEventListener('click', function() {
        if( currentEpisodeIndex < (episodes.length - 1)) {
            playNextEpisode();
        }
    })
    return $this;
}

function initPrevBt() {
    var $this = Common.createElement('div', 'prev-bt');
    var icon = Common.createElement('span', 'prev-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-fast-backward'});
    $this.appendChild(icon);
    $this.addEventListener('click', function() {
        if(currentEpisodeIndex < (episodes.length - 1)) {
            playPrevEpisode();
        }
    })
    return $this;
}

function initMuteBt() {
    var $this = Common.createElement('div', 'mute-bt');
    Common.setParams($this, {style: 'display:none'});
    var icon = Common.createElement('span', 'mute-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon glyphicon-volume-off'});
    $this.appendChild(icon);
    return $this;
}

function initUnMuteBt() {
    var $this = Common.createElement('div', 'un-mute-bt');
    var icon = Common.createElement('span', 'un-mute-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-volume-up'});
    $this.appendChild(icon);
    return $this;
}

function initFullScreenBt() {
    var $this = Common.createElement('div', 'full-screen-bt');
    var icon = Common.createElement('span', 'full-screen-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-resize-full'});
    $this.appendChild(icon);
    return $this;
}

function initUnFullScreenBt() {
    var $this = Common.createElement('div', 'un-full-screen-bt');
    Common.setParams($this, {style: 'display:none'});
    var icon = Common.createElement('span', 'un-full-screen-bt-icon');
    Common.setParams(icon, {class:'glyphicon glyphicon-resize-small'});
    $this.appendChild(icon);
    return $this;
}

function getGroups(){
    return movieInfo.groups
}

function getCurrentGroup(){
    return getGroups()[currentGroupIndex];
}

function getQualities(){
    return movieInfo.playerSetting.qualities[currentSourceIndex];
}

function getCurrentQuality(){
    return getQualities()[currentQualityIndex];
}

function getEpisodes() {
    return movieInfo.episodes;
}


function seterrorMessage(msg) {
    Controls.errorMessage.innerText = msg;
    Common.setParams(Holders.messageHolder, { style: 'display:inline-flex' });
}


function getVideoUrl(callback) {
    showWaiting();
    callback(getCurrentQuality().file);
}

function loadNewVideo(paramVideoUrl, videoType) {
    //Common.changeAllURLParam('?e=' + currentEpisodeIndex + '&g=' + currentGroupIndex + '&q=' + currentQualityIndex);
    switch (videoType) {
        case 'mp4': Common.setParams(Controls.video, { src: paramVideoUrl });  togglePlay(); break;
        case 'embed': embedVideoIframe(paramVideoUrl); break;
        case 'drive': embedVideoIframe(paramVideoUrl); break;
        case 'youtube': embedYoutube(paramVideoUrl);break;
    }
}

function seekToTime(currentTime) {
    Controls.video.currentTime = currentTime;
}

function playNextEpisode(){
    var nextEpisodeItem = Common.findOneChildByClass(playListContent, 'episode-active').nextSibling;
    if(typeof nextEpisodeItem !== 'undefined' && nextEpisodeItem != null){
        var href = nextEpisodeItem.getElementsByTagName('a')[0].getAttribute('href');
        location.href = href;
        //nextEpisodeItem.click();
    }
}

function playPrevEpisode(){
    var prevEpisodeItem = Common.findOneChildByClass(playListContent, 'episode-active').previousSibling;
    if(typeof prevEpisodeItem !== 'undefined' && prevEpisodeItem != null){
        location.href = prevEpisodeItem.getElementsByTagName('a')[0].getAttribute('href');
        //prevEpisodeItem.click();
    }
}


function setTitle(firstName, secondName) {
    Controls.title.firstName.innerText = firstName;
    Controls.title.secondName.innerText = secondName;
}

function getWatchedInfo() {
    var cookieWatchedInfo =  $.cookie('watched-info');
    cookieWatchedInfo = (typeof cookieWatchedInfo === 'undefined')   ? {} : JSON.parse(cookieWatchedInfo);
    var key = Common.getURLWithOutParameter() + '?e=' + currentEpisodeIndex;
    if (typeof cookieWatchedInfo[key] === 'undefined') {
        cookieWatchedInfo[key] = { time: 0 } ;
    }
    return cookieWatchedInfo;
}

function getTimeWatched() {
    var key = Common.getURLWithOutParameter() + '?e=' + currentEpisodeIndex;
    return getWatchedInfo()[key].time;
}

function setTimeWatched(time) {
    var cookieWatchedInfo =  getWatchedInfo();
    var key = Common.getURLWithOutParameter() + '?e=' + currentEpisodeIndex;
    cookieWatchedInfo[key].time = time;
    $.cookie('watched-info', JSON.stringify(cookieWatchedInfo));
}

function checkSeekToCurrentTime() {
    var timeWatched =  getTimeWatched();
    if (timeWatched > 300) {
        Controls.video.pause();
        isPaused = true;
        Common.setParams(Holders.messageHolder, { style: 'display:inline-flex' });
        Holders.messageHolder.innerHTML = '';
        Controls.confirmDialog = initConfirmDialog(
            'Thông Báo',
            'Bạn đã xem đến ' + Common.toDateTime(timeWatched) + '. Bạn có muốn tiếp tục xem.',
            'Xem từ đầu',
            'Tiếp tục xem',
            function() {
                seekToTime(0);
                Controls.video.play();
                isPaused = false;
                Common.setParams(Holders.messageHolder, { style: 'display:none' });
            },
            function() {
                seekToTime(timeWatched);
                Controls.video.play();
                isPaused = false;
                Common.setParams(Holders.messageHolder, { style: 'display:none' });
            }
        );
        Holders.messageHolder.appendChild(Controls.confirmDialog);
    }
}

function initConfirmDialog(titleText, messageText, noBtText, yesBtText, ntBtClick, yesBtClick ) {
    var main = Common.createElement('div', 'confirm-dialog-main')

    var title = Common.createElement('div', 'confirm-dialog-title');
    title.innerHTML = '<p>' + titleText + '</p>';

    var message = Common.createElement('div', 'confirm-dialog-message');
    message.innerHTML = '<p>' + messageText + '</p>';;

    var noBt = Common.createElement('div', 'confirm-dialog-noBt');
    noBt.innerText = noBtText;
    noBt.addEventListener("click", ntBtClick);

    var yesBt = Common.createElement('div', 'confirm-dialog-yesBt');
    yesBt.innerText = yesBtText;
    yesBt.addEventListener("click", yesBtClick);

    main.appendChild(title);
    main.appendChild(message);
    main.appendChild(noBt);
    main.appendChild(yesBt);
    main.attribute = { title: title, message:message, noBt:noBt, yesBt:yesBt}
    return main;
}

function embedVideoIframe(src) {
    //playListControlBar.innerText = '';
    Common.setParams( Controls.videoIframe, { allowfullscreen: "allowfullscreen" });
    Common.setParams( Controls.videoIframe, { src: src });
    Holders.videoHolder.innerHTML = '';
    Holders.videoHolder.appendChild(Controls.videoIframe);
}

function embedYoutube(youtubeUrl) {
    var youtubeUrlParse = youtubeUrl.split('=');
    var youtubeKey = youtubeUrlParse[youtubeUrlParse.length - 1];
    Common.setParams( Controls.videoIframe, { allowfullscreen: "allowfullscreen" });
    Common.setParams( Controls.videoIframe, { src: "https://www.youtube.com/embed/" + youtubeKey + "?autoplay=1" });
    Holders.videoHolder.innerHTML = '';
    Holders.videoHolder.appendChild(Controls.videoIframe);
}

function getVideoUrlBk() {
    try{
        currentSourceIndex++;
        if(typeof getCurrentQuality() !== 'undefined') {
            return getCurrentQuality().file;
        }
    }catch(e){
        return '';
    }

}