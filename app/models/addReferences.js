module.exports = function (sequelize) {
    sequelize.models.movie.hasMany(sequelize.models.victim, { foreignKey: 'movieId' });
    sequelize.models.victim.belongsTo(sequelize.models.movie, { foreignKey: 'movieId' });

    sequelize.models.victim.hasMany(sequelize.models.episode, { foreignKey: 'victimId' });
    sequelize.models.episode.belongsTo(sequelize.models.victim, { foreignKey: 'victimId' });

    sequelize.models.movie.belongsToMany(sequelize.models.actor, { through : "movie_actor", foreignKey: 'movieId' });
    sequelize.models.actor.belongsToMany(sequelize.models.movie, { through : "movie_actor", foreignKey: 'actorId' });

    sequelize.models.movie.belongsToMany(sequelize.models.category, { through : "movie_category", foreignKey: 'movieId' });
    sequelize.models.category.belongsToMany(sequelize.models.movie, { through : "movie_category", foreignKey: 'categoryId' });

    sequelize.models.movie.belongsToMany(sequelize.models.director, { through : "movie_director", foreignKey: 'movieId' });
    sequelize.models.director.belongsToMany(sequelize.models.movie, { through : "movie_director", foreignKey: 'directorId' });

    sequelize.models.movie.belongsToMany(sequelize.models.country, { through : "movie_country", foreignKey: 'movieId'  });
    sequelize.models.country.belongsToMany(sequelize.models.movie, { through : "movie_country", foreignKey: 'countryId' });
};