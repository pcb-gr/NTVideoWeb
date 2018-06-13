var homeBean = require('../../app/beans/homeBean');
var MovieService = require('../../app/services/movieService');
var CommonService = require('../../app/services/commonService');
var Q = require('q');
module.exports = {
    init: function (req, res, next) {
        req.models.movie.find(function(err, movies) {
            movies[0].getVictim(function(err, vics) {
                console.log(movies);
            });
        });
        /*req.models.victim.find(function(err, vics) {
         vics[0].getMovie(function(err, movies) {
         console.log(movies);
         });
         });*/
        /*req.models.category.find(function(err, cats) {
         cats[0].getMovie(function(err, movies) {
         console.log(movies);
         });
         });*/
        /*var commonService = new CommonService(req.models);
         Q.fcall(function () {
         return commonService.findMenus().then(function (menusBean) {
         homeBean.randomMovies = menusBean;
         return menusBean.categories[0].getMovie(function(movies) {
         console.log(movies);
         });

         })
         }).then(function () {
         console.log(homeBean);
         });*/
    }
};
