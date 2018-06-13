var fileUtil = require('../../app/util/FileUtil');
var cryptoUtil = require('../../app/util/CryptoUtil');
var MovieService = require('../../app/services/movieService');
var serviceController = {
    getThumbByMovieId: function (req, res, next) {
        var movieId = req.params.movieId;
        var movieService = new MovieService(req.sequelize);
        return movieService.findMovieByMovieIdWithCache(movieId).then(function (movie) {
           return fileUtil.getBinaryImageWithCache(movie.victims[0].thumb).then(function(data) {
               res.writeHead(200, {'Content-Type': 'image/jpeg'});
               res.end(data); // Send the file data to the browser.
               next();
           });
        });
    },
    getPosterByMovieId: function (req, res, next) {
        var movieId = req.params.movieId;
        var movieService = new MovieService(req.sequelize);
        return movieService.findMovieByMovieIdWithCache(movieId).then(function (movie) {
            return fileUtil.getBinaryImageWithCache(movie.victims[0].poster).then(function(data) {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data); // Send the file data to the browser.
                next();
            });
        });
    },
    getSmallImageByMovieId: function (req, res, next) {
        var movieId = req.params.movieId;
        var movieService = new MovieService(req.sequelize);
        return movieService.findMovieByMovieIdWithCache(movieId).then(function (movie) {
            return fileUtil.getBinaryImageWithCache(movie.victims[0].smallImage).then(function(data) {
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data); // Send the file data to the browser.
                next();
            });
        });
    },
    getImageWithCache: function (req, res, next) {
        var victimTypeNo = req.params.victimTypeNo;
        var imageUrl = cryptoUtil.decrypt(req.params.imageUrl).replace(':w^~)^', '');
        switch (victimTypeNo)
        {
            case "0": imageUrl = 'http://media.phimbathu.com' + imageUrl; break;
            case "1": imageUrl = 'http://media.bilutv.com' + imageUrl; break;
            case "2": imageUrl = 'http://' + imageUrl; break;
        }
        fileUtil.getBinaryImage(imageUrl).then(function(data) {
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data); // Send the file data to the browser.
            next();
        });
    }
};

module.exports = function() {
    return serviceController;
}