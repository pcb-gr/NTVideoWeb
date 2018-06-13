/**
 * Created by Jeff on 9/21/2016.
 */
module.exports = {
    changeValueUrlParams: function (req, urlParams) {
        var currentURLInfo = req.originalUrl.split('?');
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
    convertToAlias: function (str) {
        var self = this;
        str = self.removeVietnameseUnicode(str).trim().replace(/ /g, '-');
        return self.removeSpecialChar(str);
    },
    removeVietnameseUnicode: function (str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        return str;
    },
    removeSpecialChar: function (str) {
        str = str.replace(/!|(|)|~|'/g, "");
        while (str.indexOf("--") != -1) str = str.replace("--", "-");
        return str;
    }
}