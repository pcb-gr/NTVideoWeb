$(document).ready(function () {
    var nDomain = location.hostname.replace('m.', '');
    var videosLoaded = {};
    var videoInfos = {};
    var movieItems = $('.movie-item');

    (function () {
        for (var i = 0; i < movieItems.length; i ++){
            var movieItem = $(movieItems[i]);
            preViewVideo($(movieItem.find('a')[0]).attr('href'), movieItem.find('.pre-view-holder'));
        }
    })();

    document.addEventListener('touchmove', function(e) {
        for (var key in videosLoaded) {
            if(!videosLoaded.hasOwnProperty(key)) continue;
            if (typeof videosLoaded[key] !== 'undefined' && videosLoaded[key]['video'][0].readyState == 4 && !videosLoaded[key]['video'][0].paused)
                videosLoaded[key]['video'][0].pause();
        }
        var movieItem = getElementForPreView();
        var key = $(movieItem.find('a')[0]).attr('href');
        if (typeof videosLoaded[key] !== 'undefined' && videosLoaded[key]['video'][0].readyState != 4) {
            $(videosLoaded[key]['video'][0]).attr('src', videosLoaded[key].src);
        }
        if (typeof videosLoaded[key] !== 'undefined' && videosLoaded[key]['video'][0].readyState == 4 && videosLoaded[key]['video'][0].paused) {
            setTimeout(function () {
                videosLoaded[key]['video'][0].play();
            }, 500);
        }
    }, false);

    function destroyPreVideo() {
        $(preVideo).attr('src', '');
    }

    function preViewVideo (movieLink, preViewVideoHolder) {
        preViewVideoHolder.append('<div class="loader" id="video-loading"></div><p>Xin chờ chút, đang tải phim !!! Bạn có thể xem trước tại đây. Chúc bạn xem phim vui vẻ.</p>');
        getSrcPreviewVideoByKey(movieLink, function(videoInfo) {
            if (videoInfo.playerSetting.status == '404') {
                $(preViewVideoHolder).html('Vì lý do bản quyền nên phimcuaban.com sẽ không chiếu phim này trong thời gian hiện tại. Mong bạn thông cảm và ủng hộ.');
                return false;
            }
            if (videoInfo.playerSetting.key == 'youtube') {
                var youtubeUrlParse = videoInfo.playerSetting.qualities[currentSourceIndex][0].file.split('=');
                var youtubeKey = youtubeUrlParse[youtubeUrlParse.length - 1];
                embedYoutube($(preViewVideoHolder), youtubeKey);
            } else {
                currentSourceIndex = 0;
                var preVideo = $('<video class="preview-video" controls muted>');
                $(preViewVideoHolder).html(preVideo);
                videosLoaded[movieLink] = {video: preVideo, src: evalUtil(videoInfo.sourceKey, videoInfo.playerSetting.qualities[currentSourceIndex][videoInfo.playerSetting.qualities[currentSourceIndex].length - 1].file, videoInfo.playerSetting.key) + '#t=25'};
            }
        })
    }

    function getSrcPreviewVideoByKey(key, callback) {
        try {
           /* var videoInfo = getVideoInfoByKey(key);
            if (typeof videoInfo !== 'undefined') {
                callback(evalUtil(videoInfo.sourceKey, videoInfo.playerSetting.qualities[videoInfo.playerSetting.qualities.length - 1].file, videoInfo.playerSetting.key));
            } else {
                getVideoInfo('http://localhost:3001/thong-tin-player' + key.replace(/xem-phim-/g, ''), function(videoInfo) {
                    videoInfos[key] = videoInfo;
                    callback(evalUtil(videoInfo.sourceKey, videoInfo.playerSetting.qualities[videoInfo.playerSetting.qualities.length - 1].file, videoInfo.playerSetting.key));
                })
            }*/
            getVideoInfo('/thong-tin-player' + key.replace(/xem-phim-/g, ''), function(videoInfo) {
                callback(videoInfo);
                videoInfos[key] = videoInfo;
            })
        } catch (err) {

            callback('error');
        }
    }

    function getVideoInfoByKey(key) {
        return getBehaviorInfo()['videos'][key];
    }

    function getBehaviorInfo() {
        var cookieBehaviorInfo =  $.cookie('behavior-info');
        cookieBehaviorInfo = (typeof cookieBehaviorInfo === 'undefined')   ? {} : JSON.parse(cookieBehaviorInfo);
        if (typeof cookieBehaviorInfo[('videos' || 'preview')] === 'undefined') {
            cookieBehaviorInfo['videos'] = {};
            cookieBehaviorInfo['preview'] = {};
        }
        return cookieBehaviorInfo;
    }


   /* $('#clean-text-search').click(function () {
        $('#search-input').val('');
        $(this).hide();
        $("#search-input").keyup();
    });
    var xhrSearch = null;
    $("#search-input").keyup(function (e) {
        var waitSearchIcon = $('#wait-search-icon');
        var cleanTextSearch = $('#clean-text-search');
        waitSearchIcon.show();
        var searchListHolder = $('#search-retrieve-holder');
        var keyFilter = $(this).val().trim();
        if (keyFilter == ''){
            cleanTextSearch.hide();
            waitSearchIcon.hide();
            searchListHolder.removeClass('search-retrieve-no-data');
            searchListHolder.html('');
            return false;
        }
        cleanTextSearch.show();
        if(e.which != 13) {
            if (xhrSearch != null)  xhrSearch.abort();
            searchListHolder.removeClass('search-retrieve-no-data');
            searchListHolder.html('');
            if (keyFilter == '') return false;
            xhrSearch =$.ajax({
                url: '/tim-kiem/' + convertToAlias(keyFilter).trim() + '.html',
                type: 'GET',
                success: function (data) {
                    waitSearchIcon.hide();
                    searchListHolder.html(data);
                    if ($(data).attr('id') == 'no-data-rs') {
                        searchListHolder.addClass('search-retrieve-no-data');
                    }
                    initPcbTooltip (searchListHolder);
                }
            });
        } else {
            doSearch(keyFilter);
        }
    });

    $('#search-button').click(function () {
        var keyFilter = $('#search-input').val();
        doSearch(keyFilter);
    });

    $('#wait-search-icon').click(function () {
        var keyFilter = $('#search-input').val();
        doSearch(keyFilter);
    });

    function doSearch(rawKeyWord) {
        var keyWord = convertToAlias (rawKeyWord);
        $.cookie('keyWordCookie', keyWord + '~' + rawKeyWord);
        location.href = '/tim-kiem/' + keyWord + '.html';
    }*/

    function convertToAlias(str) {
        str = removeVietnameseUnicode(str).trim().replace(/ /g, '-');
        return removeSpecialChar(str);
    }


    $('.list-movies .view-more').click(function () {
        $this = $(this);
        var dataNextPage = $('#next-page-content-temp');
        if (dataNextPage.html() != '') {
            appendNextPageContent(dataNextPage);
        }
        var pageIndex = parseInt(getURLParameter("trang"));
        pageIndex = (pageIndex == 0) ?  2 : (pageIndex + 1);
        var nextPageUrl = changeValueUrlParams([{name:"trang", value:pageIndex}]);
        pushNewURLToAddress(nextPageUrl);
        checkNextPage(pageIndex, function (isNextPageExist, data) {
            var nextPageContentTemp = $('#next-page-content-temp').html('');
            (!isNextPageExist) ? $this.hide() : nextPageContentTemp.html(data);
            //initLazyLoad();
        });
    });

    function appendNextPageContent(data) {
        initPcbTooltip(data);
        $('#movie-items-container').append(data.find('.movie-item'));
    }
});


function appendWaiting(container) {
    $(container).html('<img style="margin: auto; width: 200px" src="/images/loading-icon.gif" />');
}

function checkNextPage(pageIndex, callback) {
    var nextPageUrl = changeValueUrlParams([{name:"trang", value:(pageIndex + 1)}]);
    loadPage(nextPageUrl, function (data) {
        callback($(data).find('.movie-item').length > 0, data);
    });
}

function loadPage(url, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        success: function (data) {
            callback(data);
        }
    });
}


function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||0;
}

function pushNewURLToAddress(newUrl) {
    if (typeof (history.pushState) != "undefined") {
        history.pushState({}, null, newUrl);
        return newUrl;
    } else {
        alert("Browser does not support HTML5.");
    }
}

function changeValueUrlParams(urlParams) {
    var currentURLInfo = window.location.href.split('?');
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
}

function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    //find & remove port number
    domain = domain.split(':')[0];
    return domain;
}

function hasDomain(url) {
    if (url.indexOf("://") != -1) {
        return true;
    }
    return false;
}

function formatNumber(numbers, splitChar) {
    numbers = reverseString(numbers);
	var temp = '';
    for (var i = 0; i < numbers.length; i++) {
        if (i != 0 && i % 3 == 0) {
            temp += splitChar;
        }
        temp += numbers[i];
    }
	return reverseString(temp);
}

function reverseString(s){
    return s.split("").reverse().join("");
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||'0';
}

function removeVietnameseUnicode(str){
    str= str.toLowerCase();
    str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");
    str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");
    str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");
    str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");
    str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");
    str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");
    str= str.replace(/đ/g,"d");
    return str;
}

function removeSpecialChar (str) {
    str = str.replace(/!|(|)|~|'/g, "");
    while (str.indexOf("--") != -1) str = str.replace("--", "-");
    return str;
}

function getVideoInfo(url, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        success: function (videoInfo) {
            callback(videoInfo);
        }
    });
}

function embedYoutube(container, youtubeId) {
    var youtubeVideoIframe = '<iframe frameBorder="0" width="100%" height="100%" src="https://www.youtube.com/embed/' + youtubeId + '?autoplay=1' + '"></iframe>';
    container.html(youtubeVideoIframe);
}

function getElementForPreView() {
    var movieItems = $('.movie-item');
    for (var i = 0; i < movieItems.length; i ++){
        var movieItem = $(movieItems[i]);
        if (elementInView(movieItem)) {
            return movieItem;
            break;
        }
    }
}

function elementInView(element) {
    var pageTop = $(window).scrollTop() + ($(window).height()/3);
    var pageBottom = pageTop + $(window).height();
    var elementTop = $(element).offset().top;
    var elementBottom = elementTop + $(element).height();
    return ((elementTop <= pageBottom) && (elementBottom >= pageTop));
}