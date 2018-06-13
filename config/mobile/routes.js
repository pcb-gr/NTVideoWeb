var controllers = require('../../app/controllers/mobile');
var rewrite = require('express-urlrewrite');

module.exports = function (app) {
    app.use('/error/*', controllers.error.init);

    app.get('/trang-chu.html', rewrite('/home'));
    app.get('', rewrite('/home'));
    app.use('/home', controllers.home.init);

    app.get('/phim-le.html', rewrite('/phim-le/:subAlias'));
    app.get('/phim-le-:subAlias.html', rewrite('/phim-le/:subAlias'));
    app.use('/phim-le/:subAlias', controllers.list.listOneEpisodeMovie);

    app.get('/phim-bo.html', rewrite('/phim-bo/:subAlias'));
    app.get('/phim-bo-:subAlias.html', rewrite('/phim-bo/:subAlias'));
    app.use('/phim-bo/:subAlias', controllers.list.listMultiEpisodeMovie);

    app.get('/phim-thuyet-minh.html', rewrite('/phim-thuyet-minh/:subAlias'));
    app.get('/phim-thuyet-minh-:subAlias.html', rewrite('/phim-thuyet-minh/:subAlias'));
    app.use('/phim-thuyet-minh/:subAlias', controllers.list.listHasTransMovie);

    app.get('/phim-long-tieng.html', rewrite('/phim-long-tieng/:subAlias'));
    app.get('/phim-long-tieng-:subAlias.html', rewrite('/phim-long-tieng/:subAlias'));
    app.use('/phim-long-tieng/:subAlias', controllers.list.listHasDubbingMovie);

    app.get('/phim-phu-de.html', rewrite('/phim-phu-de/:subAlias'));
    app.get('/phim-phu-de-:subAlias.html', rewrite('/phim-phu-de/:subAlias'));
    app.use('/phim-phu-de/:subAlias', controllers.list.listHasSubMovie);

    app.get('/top-phim-danh-gia.html', rewrite('/top-phim-danh-gia'));
    app.use('/top-phim-danh-gia', controllers.list.listMostRatingMovies);

    app.get('/top-phim-xem-nhieu.html', rewrite('/top-phim-xem-nhieu'));
    app.use('/top-phim-xem-nhieu', controllers.list.listMostViewedMovies);

    app.get('/phim-xuat-ban-nam-:publishYear.html', rewrite('/phim-xuat-ban-nam/:publishYear'));
    app.use('/phim-xuat-ban-nam/:publishYear', controllers.list.listMovieByPublishYear);

    app.get('/phim-:subAlias-' + (new Date().getFullYear()) + '.html', rewrite('/phim-:subAlias/' + (new Date().getFullYear())));
    app.use('/phim-:subAlias/' + (new Date().getFullYear()), controllers.list.listMovieByLastYear);

    app.get('/tv-show.html', rewrite('/tv-show/:subAlias'));
    app.get('/tv-show-:subAlias.html', rewrite('/tv-show/:subAlias'));
    app.use('/tv-show/:subAlias', controllers.list.listTvShow);

    app.get('/phim-:subAlias.html', rewrite('/phim-:subAlias'));
    app.use('/phim-:subAlias', controllers.list.init);

    app.get('/tim-kiem/:keyWord.html', rewrite('/tim-kiem/:keyWord'));
    app.use('/tim-kiem/:keyWord', controllers.search.search);

    app.get('/xem-phim-:movieAlias.html', rewrite('/watch/:movieAlias'));
    app.use('/watch/:movieAlias', controllers.watch.init);
    app.use('/thong-tin-player/:movieAlias.html', controllers.watch.getInfoPlayer);
};
