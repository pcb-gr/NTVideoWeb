var settings = {
    port: (process.env.NODE_ENV == 'production') ? process.env.OPENSHIFT_NODEJS_PORT : 3001,
    ipAddress: (process.env.NODE_ENV == 'production') ? process.env.OPENSHIFT_NODEJS_IP : 'localhost',
    //siteName: 'phimcuaban.com',
    siteName: 'localhost',
    mobileSub: 'm',
   /* database: {
        protocol: "mysql",
        query: {pool: true},
        host: (process.env.NODE_ENV == 'production') ? "581031347628e1030900024d-bilu.rhcloud.com" : "localhost",
        database: "pcb_phim_moi",
        username: (process.env.NODE_ENV == 'production') ? "adminVzyjGfC" : "root",
        password: (process.env.NODE_ENV == 'production') ? "lCvjDI2vGnxt" : "",
        port: (process.env.NODE_ENV == 'production') ? 49831 : 3306
    },*/

    database: {
        protocol: "mysql",
        query: {pool: true},
        host: "localhost",
        database: "nt_pcb_1_4",
        username: "root",
        password: "",
        port: 3306
    }
    /*database: {
         protocol: "mysql",
         query: {pool: true},
         host: "localhost",
         database: "nt_pcb_1_3",
         username: "adminVzyjGfC",
         password: "lCvjDI2vGnxt",
         port: 49831
     }*/
};

module.exports = settings;
