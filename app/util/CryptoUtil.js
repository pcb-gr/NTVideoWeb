/**
 * Created by Jeff on 9/21/2016.
 */
module.exports = {
    password: '1624558d5f8c89aadb89ae0b0fddb5f7',
    encrypt: function (text) {
        var crypted = new Buffer(text).toString('base64') + this.password;
        crypted = new Buffer(crypted).toString('base64');
        return crypted;
    },
    decrypt: function (text) {
        var dec = new Buffer(text, 'base64').toString('ascii').replace(this.password, '');
        dec = new Buffer(dec, 'base64').toString('ascii');
        return dec;
    },
    base64Encode: function(text) {
        return new Buffer(text).toString('base64');
    },
    base64Decode: function(text) {
        return new Buffer(text, 'base64').toString('ascii');
    }
}