$(document).ready(function () {
    // Using custom configuration
    $('.carousel').carouFredSel({
        items: 5,
        scroll: {
            items: 5,
            fx: "scroll",
            easing: "swing",
            duration: 600,
            pauseOnHover: true,
            mousewheel: true,
        }, prev: {
            button: ".carousel-prev",
            key: "left"
        },
        next: {
            button: ".carousel-next",
            key: "right"
        }
    });

    $('div[id^="carousel-"]').each(function (index, carouselItem) {
        initCarousel (carouselItem);
    });

    function initCarousel (carouselItem) {
        var childrens = $(carouselItem).children();
        var childrensCount = childrens.length;
        var classAttr = $(childrens[0]).attr('class');
        var parentTemp = $('<div>');
        var itemTemp;
        var i = 0;
        while (i < childrensCount) {
            if (i % 2 == 0) {
                itemTemp = $('<div class="' + classAttr + '">');
                $(parentTemp).append(itemTemp);
            }
            var child = $(childrens[i++]).clone();
            child.removeAttr('class');
            child.css('position', 'relative');
            $(itemTemp).append(child)
        }
        $(carouselItem).html($(parentTemp).html());
        var prevBtSelector = function () {
            return $(carouselItem).next(".carousel-prev");
        };
        var nextBtSelector = function () {
            return $(prevBtSelector()).next(".carousel-next");
        };
        $(carouselItem).carouFredSel({
            items: 4,
            direction: "right",
            auto: false,
            scroll: {
                items: 4,
                fx: "scroll",
                easing: "swing",
                duration: 600,
                pauseOnHover: true,
            }, prev: {
                button: prevBtSelector(),
                key: "left"
            },
            next: {
                button: nextBtSelector(),
                key: "right"
            }
        });
    }

    var mouseIsOver = false;
    var tooltipHolder = $('#tooltip-holder');
    var preVideo = $('<video class="preview-video" controls autoplay muted>');
    function initPcbTooltip (parentContainer) {
        $(parentContainer).find('.pcb-tooltip').each(function (index, pcbTooltip) {
            var $this = $(pcbTooltip);
            var parentItem = $this.parent();
            var arrow, top, left;

            tooltipHolder.bind('mouseover', function (event) {
                mouseIsOver = true;
            }).bind('mouseleave', function () {
                mouseIsOver = false;
            });
            parentItem.bind('mouseover',function () {
                if (mouseIsOver) return false;
                mouseIsOver = true;
                tooltipHolder.find('#tooltip-content').html($this.clone().html());
                //moveImageOnTop(tooltipHolder);
                //maskedImage(tooltipHolder);
                preViewVideo($(parentItem.find('a')[0]).attr('href'), tooltipHolder.find('.pre-view-holder'));
                arrow = tooltipHolder.find('#tooltip-arrow');
                var posMouse = (parentItem.offset().top - $(window).scrollTop());
                if (posMouse < ($(window).height() / 3)) {
                    top = (parentItem.offset().top + parentItem.height());
                    arrow.removeClass('rotate-270');
                    arrow.addClass('rotate-90');
                    arrow.css('top', -22);
                } else {
                    top = (parentItem.offset().top - (tooltipHolder.height() + 20));
                    arrow.removeClass('rotate-90');
                    arrow.addClass('rotate-270');
                    arrow.css('top', tooltipHolder.height() + 15);
                }
                tooltipHolder.css('top', top);

                if (parentItem.offset().left < tooltipHolder.width()) {
                    left = (parentItem.offset().left );
                    arrow.css('left', 17);
                } else {
                    left = (parentItem.offset().left - tooltipHolder.width() + parentItem.width() - 30);
                    arrow.css('left', tooltipHolder.width() - 17);
                }
                tooltipHolder.css('left', left);
                if (tooltipHolder.is(':hidden')) {
                    tooltipHolder.show();
                }
            }).bind('mouseleave', function () {
                mouseIsOver = false;
            });
        })
    }

    setInterval(function () {
        if (!mouseIsOver && !tooltipHolder.is(':hidden')) {
            destroyPreVideo();
            tooltipHolder.hide();
        }
    }, 100);

    function destroyPreVideo() {
        $(preVideo).attr('src', '');
    }

    function preViewVideo (movieLink, preViewVideoHolder) {
        preViewVideoHolder.append('<div class="loader" id="video-loading"></div><p>Xin chờ chút, đang tải phim !!! Bạn có thể xem trước tại đây. Chúc bạn xem phim vui vẻ.</p>');
        getSrcPreviewVideoByKey(movieLink, function(src) {
            preVideo.attr('src', src);
            $(preViewVideoHolder).html(preVideo);
            preVideo.unbind( "click" ).click(function () {
                location.href = movieLink;
            })
        })
    }

    function getSrcPreviewVideoByKey(key, callback) {
        var videoInfo = getVideoInfoByKey(key);
        if (typeof videoInfo !== 'undefined') {
            callback(evalUtil(videoInfo.sourceKey, videoInfo.playerSetting.qualities[videoInfo.playerSetting.qualities.length - 1].file, videoInfo.playerSetting.key));
        } else {
            getVideoInfo('/thong-tin-player' + key.replace(/xem-phim-/g, ''), function(videoInfo) {
                setVideoInfoByKey(key, videoInfo);
                callback(evalUtil(videoInfo.sourceKey, videoInfo.playerSetting.qualities[videoInfo.playerSetting.qualities.length - 1].file, videoInfo.playerSetting.key));
            })
        }
    }

    function setBehavior(key, value) {
        setPreviewCount(key);
        setVideoInfoByKey(key, value)
    }

    function setPreviewCount(key) {
        var cookieBehaviorInfo = getBehaviorInfo();
        if (typeof cookieBehaviorInfo['preview'][key] === 'undefined') {
            cookieBehaviorInfo['preview'][key] = { count : 0 };
        } else {
            cookieBehaviorInfo['preview'][key].count ++;
        }
        $.cookie('behavior-info', JSON.stringify(cookieBehaviorInfo));
    }

    function setVideoInfoByKey(key, value) {
        var cookieBehaviorInfo = getBehaviorInfo();
        if (typeof cookieBehaviorInfo['videos'][key] === 'undefined') {
            cookieBehaviorInfo['videos'][key] = value;
        }
        $.cookie('behavior-info', JSON.stringify(cookieBehaviorInfo), { expires: getCookieTime(60 * 6) });
    }

    function getCookieTime(minutes) {
        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        return date;
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

    function initLazyLoad(){
        var lazyImages = $('body').find('.lazy-image');
        lazyImages.attr('data-src', lazyImages.attr('src'));
        lazyImages.removeAttr('src');
        lazyImages.lazyImage();
    }

    initPcbTooltip('body');

    function moveImageOnTop(description) {
        $this = $(description);
        var images = $this.find('img');
        if (images.length > 0) {
            $this.find('.tab').prepend($(images[0]).clone());
            $(images[0]).closest('p').remove();
        }
    }

    $("#close-bt").click(function () {
        $(".filter-hidden").css('left', 10000);
        $('body').css("overflow", "auto");
    });

    $("#show-filter-bt").click(function () {
        $(".filter-hidden").css('left', 0);
        $('body').css("overflow", "hidden");
    });
    $("#actor-filter-input").keyup(function () {
        var keyFilter = $(this).val().trim();
        var actorsListHolder = $('#actors-list');
        if (keyFilter == '') {actorsListHolder.find('li').show(); return false;}
        actorsListHolder.find('li').hide();
        var lisMatched = actorsListHolder.find("li[name^='" + convertToAlias(keyFilter) + "']");
        lisMatched.show();
    });
    $("#director-filter-input").keyup(function () {
        var keyFilter = $(this).val().trim();
        var directorsListHolder = $('#directors-list');
        if (keyFilter == '') {directorsListHolder.find('li').show(); return false;}
        directorsListHolder.find('li').hide();
        var lisMatched = directorsListHolder.find("li[name^='" + convertToAlias(keyFilter) + "']");
        lisMatched.show();
    });
    /*var xhrFilterActor = null;
    $("#actor-filter-input").keyup(function () {
        if (xhrFilterActor != null) xhrFilterActor.abort();
        var keyFilter = $(this).val().trim();
        var itemsHolder = $('#actors-list-ajax');
        var actorsListHolder = $('#actors-list');
        if (keyFilter == '') {
            actorsListHolder.show();
            itemsHolder.hide();
        } else {
            actorsListHolder.hide();
            itemsHolder.show();
            xhrFilterActor = $.ajax({
                url: '/dien-vien-' + convertToAlias(keyFilter) + '.html',
                type: 'GET',
                success: function (data) {
                    autoCompletedFilter(data, keyFilter, 'actor', function(items) {
                        itemsHolder.html(items);
                        actorListHandle ('#actors-list-ajax');
                    });
                }
            });
        }

    });
    var xhrFilterDirector = null;
    $("#director-filter-input").keyup(function () {
        if (xhrFilterDirector != null) xhrFilterDirector.abort();
        var keyFilter = $(this).val().trim();
        var itemsHolder = $('#directors-list-ajax');
        var directorsListHolder = $('#directors-list');
        if (keyFilter == '') {
            directorsListHolder.show();
            itemsHolder.hide();
        } else {
            directorsListHolder.hide();
            itemsHolder.show();
            xhrFilterDirector = $.ajax({
                url: '/dao-dien-' + convertToAlias(keyFilter) + '.html',
                type: 'GET',
                success: function (data) {
                    autoCompletedFilter(data, keyFilter, 'director', function(items) {
                        itemsHolder.html(items);
                        directorListHandle ('#directors-list-ajax');
                    });
                }
            });
        }
    });
    function autoCompletedFilter (items, keyFilter, idName, callback) {
        var keyFilterAfterRemoveVietnameseUnicode = removeVietnameseUnicode(keyFilter).trim();
        var ul = $('<ul>');
        items.forEach(function (item) {
            if (removeVietnameseUnicode(item.name).indexOf(keyFilterAfterRemoveVietnameseUnicode) != -1) {
                var regEx = new RegExp(keyFilter, "ig");
                var name = item.name.replace(regEx, '<span class="filter-matched">' + keyFilter + '</span>');
                ul.append('<li class="top-menu-l2-li"><h2>' +
                    '<input type="checkbox" id="after-' + idName + '-id-' + item[idName + 'Id'] + '">' +
                    '<label for="after-' + idName + '-id-' + item[idName + 'Id'] + '"></label>' +
                    '<a class="top-menu-l2-li-a" title="' + item.name + '">' + name);

            }
        });
        callback(ul.html());
    }*/

    $('#clean-text-search').click(function () {
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
    }

    function convertToAlias(str) {
        str = removeVietnameseUnicode(str).trim().replace(/ /g, '-');
        return removeSpecialChar(str);
    }

    actorListHandle ('#actors-list');
    function actorListHandle (actorListType) {
        $(actorListType + " input[type='checkbox']").click(function () {
            var $this = $(this);
            var actorSelectedId = $this.attr('id').split('-')[2];
            var actorSelectedValue = $this.closest('h2').find('a').text();
            var actorSelectedHolder = $('#actor-selected-holder');
            var actorSelected = actorSelectedHolder.find('#actor-selected-id-' + actorSelectedId);
            if ($this.is(':checked') && actorSelected.length == 0) {
                actorSelected = $('<div id="actor-selected-id-' + actorSelectedId + '">');
                actorSelected.text(actorSelectedValue);
                var removeIcon = $('<label>X</label>')
                removeIcon.click(function () {
                    removeIcon.closest('div').remove();
                    $this.click();
                });
                actorSelected.append(removeIcon);
                actorSelectedHolder.append(actorSelected);
            } else {
                actorSelected.remove();
            }
        })
    }

    directorListHandle ('#directors-list');
    function directorListHandle (directorListType) {
        $(directorListType + " input[type='checkbox']").bind('click',function () {
            var $this = $(this);
            var directorSelectedId = $this.attr('id').split('-')[2];
            var directorSelectedValue = $this.closest('h2').find('a').text();
            var directorSelectedHolder = $('#director-selected-holder');
            var directorSelected = directorSelectedHolder.find('#director-selected-id-' + directorSelectedId);
            if ($this.is(':checked') && directorSelected.length == 0) {
                directorSelected = $('<div id="director-selected-id-' + directorSelectedId + '">');
                directorSelected.text(directorSelectedValue);
                var removeIcon = $('<label>X</label>')
                removeIcon.click(function () {
                    removeIcon.closest('div').remove();
                    $this.click();
                });
                directorSelected.append(removeIcon);
                directorSelectedHolder.append(directorSelected);
            } else {
                directorSelected.remove();
            }
        })
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

    var currentPage = parseInt(getURLParameter("trang"));
    if (location.href.indexOf('xem-phim') == -1) {
        checkNextPage((currentPage == 0) ?  1 : currentPage, function (isNextPageExist, data) {
            var nextPageContentTemp = $('#next-page-content-temp').html('');
            if (isNextPageExist) {
                nextPageContentTemp.html(data);
                //initLazyLoad();
                $('.view-more').show();
            }
        });
    }

    function appendNextPageContent(data) {
        initPcbTooltip(data);
        $('#movie-items-container').append(data.find('.movie-item'));
    }

    $('#filter-bt').click(function () {
        var qTemp = [], qParams = [];
        qTemp.push(buildFilterParams('qcata'));
        qTemp.push(buildFilterParams('qca'));
        qTemp.push(buildFilterParams('qaa'));
        qTemp.push(buildFilterParams('qda'));
        qTemp.push(buildFilterParams('qkm'));
        qTemp.push(buildFilterParams('qcv'));
        qTemp.forEach(function (qParam) {
            if (qParam != '') qParams.push(qParam);
        })
        location.href = '/loc-phim.html?' + qParams.join('&');
    })

    function buildFilterParams (selector) {
        var qAlias = [];
        $('.' + selector + ':checked').each(function (index, checkedItem) {
            qAlias.push($(checkedItem).attr('name'));
        })
        return (qAlias.length > 0) ? selector + '=' + qAlias.join(',') : '';
    }

    $('.content-middle-bottom-left-block-header h2 a').click(function () {
        $this = $(this);
        var parentContainer = $this.closest('.content-middle-bottom-left-block-header').next('.caroufredsel_wrapper');
        parentContainer.attr('class', 'image-zoom');
        parentContainer.attr('attr', '');
        appendWaiting(parentContainer);
        loadPage($this.attr('href'), function (data) {
            parentContainer.html($(data).html());
            initCarousel(parentContainer);
            initPcbTooltip(parentContainer);
        });
        return false;
    })
});

function maskedImage(description) {
    $this = $(description);
    var images = $this.find('img');
    if (images.length > 0) {
        $(images).each(function () {
            var image = $(this);
            var imgHolder = $('<div class="img-holder" style="position: relative">');
            imgHolder.append(image.clone());
            var mask = getMask();
            imgHolder.append(mask);
            image.replaceWith(imgHolder);
        })
    }
}

function getMask() {
    var mask = $('<div class="mask-des">Phimcuaban.com</div>');
    return mask;
}

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
