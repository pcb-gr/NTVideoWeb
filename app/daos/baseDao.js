/**
 * Created by Jeff on 9/24/2016.
 */

var baseDao = {
    sequelize: {},
    find: function (query, params) {
        var self = this;
        return self.sequelize.query(
            query,
            params
        ).then(function (data) {
            return data;
        }).catch(function (ex) {
            return Array();
        });
    },
	repairAllTable: function () {
        var self = this;
		var queryRepairAllTable = 'REPAIR TABLE actor;'                                          
				+ 'REPAIR TABLE category;'                                          
				+ 'REPAIR TABLE `comment`;'                                           
				+ 'REPAIR TABLE country;'                                          
				+ 'REPAIR TABLE director;'                                         
				+ 'REPAIR TABLE download;'                                          
				+ 'REPAIR TABLE episode;'                                   
				+ 'REPAIR TABLE episode_need_update_to_live;'                      
				+ 'REPAIR TABLE home_page_position;'                               
				+ 'REPAIR TABLE keyword;'                                          
				+ 'REPAIR TABLE movie;'                                           
				+ 'REPAIR TABLE movie_actor;'                                       
				+ 'REPAIR TABLE movie_category;'                                    
				+ 'REPAIR TABLE movie_country;'                                    
				+ 'REPAIR TABLE movie_director;'                                    
				+ 'REPAIR TABLE trailer;'                                         
				+ 'REPAIR TABLE upload;'                                           
				+ 'REPAIR TABLE victim;';
        self.sequelize.query(queryRepairAllTable).then(function (data) {
			return data;
		}).catch(function (ex) {
			return Array();
		});
    }
}

module.exports = function(sequelize) {
    baseDao.sequelize = sequelize;
    sequelize.daos.baseDao = baseDao;
    return baseDao;
}