/**
 * Created by nguyennt-pc on 9/25/2016.
 */

module.exports = {
    whereMovie: {
        published: ' WHERE movie.isPublic = 1 ',
    },
    movieJoinWith: {
        victim: " INNER JOIN victim ON movie.movieId = victim.movieId ",
        country: " INNER JOIN movie_country ON movie_country.movieId = movie.movieId"
        + " INNER JOIN country ON movie_country.countryId = country.countryId ",
        category: " INNER JOIN movie_category ON movie_category.movieId = movie.movieId"
        + " INNER JOIN category ON movie_category.categoryId = category.categoryId ",
        actor: " INNER JOIN movie_actor ON movie.movieId = movie_actor.movieId"
        + " INNER JOIN actor ON actor.actorId = movie_actor.actorId ",
        director: " INNER JOIN movie_director ON movie.movieId = movie_director.movieId"
        + " INNER JOIN director ON director.directorId = movie_director.directorId ",
    },
    buildPaging: function (pagingInfo) {
        if (typeof pagingInfo === "undefined" || pagingInfo == null) return '';
        var offset = (pagingInfo.currentPage == 1 || typeof pagingInfo.currentPage === "undefined") ? '' : (((pagingInfo.currentPage * pagingInfo.totalOnPage) - pagingInfo.totalOnPage) + 1) + ',';
        var limit = pagingInfo.totalOnPage;
        var pagingQuery = ' LIMIT ' + offset + limit;
        return pagingQuery;
    },
    buildOrderQuery: function (filterOrderInfo) {
        var orderQuery = ' ORDER BY movie.publishYear DESC, victim.priority DESC, victim.dateUpdate DESC, victim.viewed, rand() DESC'; // order by newest movie
        if (typeof  filterOrderInfo === 'undefined') return orderQuery;
        switch (filterOrderInfo)
        {
            case 'newest-random' : orderQuery = ' ORDER BY movie.publishYear DESC, rand()'; break;
            case 'most-viewed' : orderQuery = ' ORDER BY victim.viewed DESC, rand()'; break;
            case 'top-xem-nhieu' : orderQuery = ' ORDER BY victim.viewed DESC'; break;
            case 'most-viewed-in-month' : orderQuery = ' ORDER BY  victim.priority DESC, victim.viewed DESC'; break;
            case 'high-rating' : orderQuery = ' ORDER BY victim.rating DESC'; break;
            case 'top-danh-gia' : orderQuery = ' ORDER BY victim.rating DESC'; break;
            case 'last-updated' : orderQuery = ' ORDER BY movie.movieId DESC'; break;
        }
        return orderQuery;
    },
    buildJoinQueryByParams: function (params) {
        var self = this;
        if (typeof params === 'undefined') {
            //params = {in: {isTrailer: 0, vtn: 0}};
        } else {
            if (typeof params.in.isTrailer === 'undefined')
                params.in.isTrailer = 0;
           /* if (typeof params.in.vtn === 'undefined')
                params.in.vtn = 0;*/
        }
        var whereConditionItem = [];
        var replacements = [];
        var query = '';
        if(Object.keys(params).length > 0 && typeof params.in === 'undefined' && typeof params.nin === 'undefined') {
            params.in = params
        }
        if ((typeof params.in !== 'undefined' && typeof params.in.qcata !== 'undefined')
            || (typeof params.nin !== 'undefined' && typeof params.nin.qcata !== 'undefined')) {
            query += self.movieJoinWith.category;
            if (typeof params.in !== 'undefined' && typeof params.in.qcata !== 'undefined') {
                whereConditionItem.push('category.alias IN (?) AND');
                replacements.push(((params.in.qcata.indexOf(',') != -1)) ? params.in.qcata.split(',') : params.in.qcata);
            }
            if (typeof params.nin !== 'undefined' && typeof params.nin.qcata !== 'undefined') {
                whereConditionItem.push('category.alias NOT IN (?) AND');
                replacements.push(((params.nin.qcata.indexOf(',') != -1)) ? params.nin.qcata.split(',') : params.nin.qcata);
            }
        }
        if ((typeof params.in !== 'undefined' && typeof params.in.qca !== 'undefined')
            || (typeof params.nin !== 'undefined' && typeof params.nin.qca !== 'undefined')) {
            query += self.movieJoinWith.country;
            if (typeof params.in !== 'undefined' && typeof params.in.qca !== 'undefined') {
                whereConditionItem.push('country.alias IN (?) AND');
                replacements.push(((params.in.qca.indexOf(',') != -1)) ? params.in.qca.split(',') : params.in.qca);
            }
            if (typeof params.nin !== 'undefined' && typeof params.nin.qca !== 'undefined') {
                whereConditionItem.push('country.alias NOT IN (?) AND');
                replacements.push(((params.nin.qca.indexOf(',') != -1)) ? params.nin.qca.split(',') : params.nin.qca);
            }
        }
        if ((typeof params.in !== 'undefined' && typeof params.in.qaa !== 'undefined')
            || (typeof params.nin !== 'undefined' && typeof params.nin.qaa !== 'undefined')) {
            query += self.movieJoinWith.actor;
            if (typeof params.in !== 'undefined' && typeof params.in.qaa !== 'undefined'){
                whereConditionItem.push('actor.alias IN (?) AND');
                replacements.push(((params.in.qaa.indexOf(',') != -1)) ? params.in.qaa.split(',') : params.in.qaa);
            }
            if (typeof params.nin !== 'undefined' && typeof params.nin.qaa !== 'undefined'){
                whereConditionItem.push('actor.alias NOT IN (?) AND');
                replacements.push(((params.nin.qaa.indexOf(',') != -1)) ? params.nin.qaa.split(',') : params.nin.qaa);
            }
        }
        if ((typeof params.in !== 'undefined' && typeof params.in.qda !== 'undefined')
            || (typeof params.nin !== 'undefined' && typeof params.nin.qda !== 'undefined')) {
            query += self.movieJoinWith.director;
            if (typeof params.in !== 'undefined' && typeof params.in.qda !== 'undefined'){
                whereConditionItem.push('director.alias IN (?) AND');
                replacements.push(((params.in.qda.indexOf(',') != -1)) ? params.in.qda.split(',') : params.qda.qaa);
            }
            if (typeof params.nin !== 'undefined' && typeof params.nin.qda !== 'undefined'){
                whereConditionItem.push('director.alias NOT IN (?) AND');
                replacements.push(((params.nin.qda.indexOf(',') != -1)) ? params.nin.qda.split(',') : params.qda.qaa);
            }
        }

        if (typeof params.in !== 'undefined' && typeof params.in.qkm !== 'undefined') {
            var qkmWhereConditionItem = [];
            if (params.in.qkm.indexOf('phim-le') != -1)
                qkmWhereConditionItem.push('movie.isMultiEpisode = 0 OR');
            if (params.in.qkm.indexOf('phim-bo') != -1)
                qkmWhereConditionItem.push('movie.isMultiEpisode = 1 OR');
            qkmWhereConditionItem = qkmWhereConditionItem.join(' ');
            whereConditionItem.push(qkmWhereConditionItem.substr(0, qkmWhereConditionItem.lastIndexOf('OR')) + ' AND')
        }

        if (typeof params.in !== 'undefined' && typeof params.in.vtn !== 'undefined') {
            whereConditionItem.push('victim.victimTypeNo IN (?) AND');
            replacements.push(params.in.vtn);
        }

        if (typeof params.in !== 'undefined' && typeof params.in.py !== 'undefined') {
            whereConditionItem.push('movie.publishYear IN (?) AND');
            replacements.push(params.in.py);
        }

        if (typeof params.in !== 'undefined' && typeof params.in.isTrailer !== 'undefined') {
            whereConditionItem.push('victim.isTrailer IN (?) AND');
            replacements.push(params.in.isTrailer);
        }

        if (typeof params.in !== 'undefined' && typeof params.in.isContinue !== 'undefined') {
            whereConditionItem.push('victim.isContinue IN (?) AND');
            replacements.push(params.in.isContinue);
        }

        if (typeof params.in !== 'undefined' && typeof params.in.qcv !== 'undefined') {

            var qcvWhereConditionItem = [];
            if (params.in.qcv.indexOf('thuyet-minh') != -1)
                qcvWhereConditionItem.push('victim.hasTrans = 1 OR');
            if (params.in.qcv.indexOf('long-tieng') != -1)
                qcvWhereConditionItem.push('victim.hasDubbing = 1 OR');
            if (params.in.qcv.indexOf('phu-de') != -1)
                qcvWhereConditionItem.push('victim.hasSub = 1 OR');

            qcvWhereConditionItem = qcvWhereConditionItem.join(' ');
            whereConditionItem.push('(' + qcvWhereConditionItem.substr(0, qcvWhereConditionItem.lastIndexOf('OR')) + ') AND')
        }

        var whereCondition = whereConditionItem.join(' ');
        whereCondition = whereCondition.substr(0, whereCondition.lastIndexOf('AND'));
        return {query: query, whereCondition: whereCondition, replacements: replacements};
    }
}
