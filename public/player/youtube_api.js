/**
 * Created by jeff on 2/6/2016.
 */

var youtubeApi = {
    key: 'AIzaSyAaTpBdkaOpioMYyvVK998UowLZBWc7azs',
    channelName: 'ONGIOICAUDAYROIVTV3',
    channelId: 'UCIbQTBioTS3sE7piseAtkQg',
    callApi: function(apiUrl, params, callback) {
        var self = this;
        params.key = self.key;
        $.get(
            apiUrl, params, function (data) {
                callback(data);
            }
        );
    },
    getContentDetailsByChannelId: function(channelId, callback) {
        var self = this;
        var apiUrl = 'https://www.googleapis.com/youtube/v3/channelSections';
        var params = {part: 'snippet,contentDetails', channelId: channelId};
        self.callApi(apiUrl, params, callback);
    },
    getContentDetailsByUserName: function(channelName, callback) {
        var apiUrl = 'https://www.googleapis.com/youtube/v3/channels';
        var params = {part: 'contentDetails', forUsername: channelName};
        callApi(apiUrl, params, callback);
    },
    getPlaylistByPid: function(pid, callback) {
        var apiUrl = 'https://www.googleapis.com/youtube/v3/playlistItems';
        var params = {part: 'snippet', maxResults: 5, playlistId: pid};
        callApi(apiUrl, params, callback);
    },
    searchByKeyWord: function(keyWord, callback) {
        var self = this;
        var apiUrl = 'https://www.googleapis.com/youtube/v3/search';
        var params = {part: 'snippet', maxResults: 50, q: keyWord, type:'video'};
        self.callApi(apiUrl, params, callback);
    },
    appendResult: function(parent, videoId) {
        var iframe = $('<iframe  frameborder="0"/>');
        iframe.attr('src', 'https://www.youtube.com/embed/' + videoId);
        parent.append(iframe);
    }
}

/*
getContentDetailsByChannelId(channelId, function (data) {
    $.each(data.items, function (i, item) {
        console.log(item);
        var pid = item.contentDetails.relatedPlaylists.uploads;
        getPlaylistByPid(pid, function (data) {
            $.each(data.items, function (i, item) {
                console.log(item);
                appendResult($('#content'), item.snippet.resourceId.videoId);
            })
        });
    })
});
searchByKeyWord('trailer Bắt Ma Nhật Kiểu Thái', function (data) {
    $.each(data.items, function (i, item) {
        console.log(item.id.videoId);
        appendResult($('#content'), item.id.videoId);
    })
});
getContentDetailsByUserName(channelName, function (data) {
    $.each(data.items, function (i, item) {
        console.log(item);
        var pid = item.contentDetails.relatedPlaylists.uploads;
        getPlaylistByPid(pid, function (data) {
            $.each(data.items, function (i, item) {
                console.log(item);
                appendResult($('#content'), item.snippet.resourceId.videoId);
            })
        });
    })
});*/
