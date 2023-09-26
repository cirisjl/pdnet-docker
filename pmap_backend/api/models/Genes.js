/**
 * Genes.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
        //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
        //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


        //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
        //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
        //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


        //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
        //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
        //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    },

    getNames: (dbName, collectionName, callback) => {
        sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function(err, client) {
            if (err) throw err;

            var db = client.db(`${dbName}`);

            // console.log(tableName);
            let projectionVars = { projection: { _id: 0 } }
            db.collection(collectionName).find({}, projectionVars).toArray((findErr, result) => {
                // db.collection(collectionName).find({}).toArray((findErr, result) => {
                if (findErr) throw findErr;
                client.close();
                // console.log(result);
                callback(null, result);
            });
        });
    },

    createCollection: (collectionName, DBname, JSONfile, callback) => {
        sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function(err, client) {
            if (err) throw err;
            collectionName = collectionName;
            var db = client.db(`DBname`);

            db.createCollection(collectionName, (err, resp) => {
                if (err) {
                    return res.serverError(err);
                } else {
                    db.collection(collectionName).insertMany(results, (err, resp) => {
                        if (err) {
                            return res.serverError(err);
                        } else {
                            // cb();
                            return res.json("DONE")
                        }
                    })
                }
            });
        });
    }

};

