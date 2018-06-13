/**
 * Created by nguyennt-pc on 9/25/2016.
 */
Array.prototype.clone = function () {
    return this.slice(0);
};
Array.prototype.remove = function (index) {
    return this.splice(index, 1);
};
Object.prototype.size = function () {
    return Object.keys(this).length;
}
Object.prototype.mergeObject = function (obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            this[key] = obj[key];
        }
    }
}
Object.prototype.mergeObjectDistinct = function (obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key) && !this.hasOwnProperty(key)) {
            this[key] = obj[key];
        }
    }
}
Array.prototype.mergeArray = function (obj) {
    for (var i = 0; i < obj.length; i++) {
        this.push(obj[i]);
    }
}
Array.prototype.mergeArrayDistinct = function (obj, keyCompare) {
    var self = this;
    var arrayKeys = [];
    for (var i = 0; i < self.length; i++) {
        arrayKeys.push(self[i][keyCompare]);
    }
    obj.forEach(function (item) {
        if (arrayKeys.indexOf(item[keyCompare]) == -1) {
            self.push(item);
        }
    })
}

Array.prototype.remove = function (objCompare) {
    var self = this;
    self.forEach(function (item, index) {
        if (item[objCompare.key] == objCompare.value) {
            self.splice(index, 1);
        }
    })
}

String.prototype.removeHtml = function () {
    return this.replace(/(<([^>]+)>)/ig, "").trim();
}

Date.prototype.toISOString = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
    var hh = this.getHours();
    var mn = this.getMinutes();
    var ss = this.getSeconds();
    return [this.getFullYear(),
            (mm > 9 ? '' : '0') + mm,
            (dd > 9 ? '' : '0') + dd
        ].join('-') + 'T' +
        [
            (hh > 9 ? '' : '0') + hh,
            (mn > 9 ? '' : '0') + mn,
            (ss > 9 ? '' : '0') + ss
        ].join(':') + '+00.00';
};
String.prototype.isNumber = function () {
    return (typeof this == "number");
}
