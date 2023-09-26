/**
 * Files.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const Networks = require("./Networks");

const mongo = sails.config.globals.MongoClient;
const urlDB = sails.config.globals.mongourl;

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

    getColumnNames: (databaseName, collectionName, callback) => {
        console.log(databaseName, collectionName)
        mongo.connect(urlDB, { useUnifiedTopology: true }, function (err, client) {
            if (err) {
                callback(err);
            }
            // collectionName = collectionName;
            var db = client.db(`${databaseName}`);
            db.collection(collectionName).findOne({}, { projection: { _id: 0 } }, (err, resp) => {
                if (err) {
                    callback(err);
                } else if (resp) {
                    let columnArr = Object.keys(resp);
                    callback(null, columnArr);
                } else {
                    callback(null, false)
                }
            })
        });
    },

    createCollection: (results, collectionNameByUser, callback) => {
        mongo.connect(urlDB, { useUnifiedTopology: true }, function (err, client) {
            if (err) {
                callback(err);
            }
            collectionName = collectionNameByUser;
            var db = client.db('stringdb');
            db.collection(collectionName).insertMany(results, (err, resp) => {
                if (err) {
                    callback(err);
                } else {
                    // console.log('here',resp);
                    callback(null, resp);
                }
            })
        });
    },

    getNetworkFromCSV: (result, callback) => {
        // console.log('RES', result);

        let node = [];
        let links = [];
        let nodes = [];
        let headerNames = []

        let r = result[0];
        for (let key in r) {
            headerNames.push(key);
        }

        result.forEach(r => {
            // console.log(r);
            if (node.includes(r[headerNames[0]]) == false) {
                node.push(r[headerNames[0]])
            }
            if (node.includes(r[headerNames[1]]) == false) {
                node.push(r[headerNames[1]])
            }
        })

        console.log(node);

        Networks.getNodeExistDetailsParallel(node, (err, foundData) => {
            if (err) {
                callback(err);
            } else {
                node = [];
                async.eachSeries(result, (e, cb) => {
                    let foundresp = false;
                    let node1 = e[headerNames[0]];
                    let node2 = e[headerNames[1]];
                    let score = e[headerNames[2]];
                    let custom_obj = {}
                    
                    if (foundData[node1] != null && foundData[node2] != null) {
                        custom_obj[node1] = foundData[node1];
                        custom_obj[node2] = foundData[node2];
                        foundresp = true;
                    }

                    // console.log(foundresp);

                    if (foundresp && (score / 1 == score)) {

                        if (!node.includes(e[`${headerNames[0]}`])) { // inserting node infos of source nodes in nodes array
                            obj = {};
                            obj.id = e[`${headerNames[0]}`];
                            obj.Description = custom_obj[obj.id].Description;
                            obj.label = custom_obj[obj.id].SYMBOL;
                            node.push(e[`${headerNames[0]}`]);
                            nodes.push(obj);
                        }
                        if (!node.includes(e[`${headerNames[1]}`])) { // inserting node infos of target nodes in nodes array
                            obj = {};
                            obj.id = e[`${headerNames[1]}`];
                            obj.Description = custom_obj[obj.id].Description;
                            obj.label = custom_obj[obj.id].SYMBOL;
                            node.push(e[`${headerNames[1]}`]);
                            nodes.push(obj);
                        }
                        if (e[`${headerNames[2]}`]) { // if weight is zero then there should be no connection so, this become false
                            obj2 = {};
                            obj2.source = node.indexOf(e[`${headerNames[0]}`]);
                            obj2.target = node.indexOf(e[`${headerNames[1]}`]);
                            obj2.weight = e[`${headerNames[2]}`];
                            links.push(obj2);
                        }
                    }
                    setTimeout(() => {
                        cb();
                    }, 0.5)
                }, (err) => {
                    console.log('DONE');
                    callback(null, { "directed": false, "graph": [], links: links, nodes: nodes });
                });
            }
        })

        // async.eachSeries(result, (e, cb) => {
        //     let node1 = e[headerNames[0]];
        //     let node2 = e[headerNames[1]];
        //     let score = e[headerNames[2]];

        //     let arr = [node1, node2];

        //     Networks.getNodeExistDetails(arr, (err, foundData) => {
        //         if (err) {
        //             callback(err);
        //         } else {
        //             let flag_data404;
        //             foundData.forEach(d => {
        //                 for (x in d) {
        //                     flag_data404 = d[x].length == 0 ? true : false;
        //                 }
        //             })

        //             console.log(flag_data404, 'flag_data404')

        //             if (flag_data404 == false && (score / 1 == score)) {

        //                 if (!node.includes(e[`${headerNames[0]}`])) { // inserting node infos of source nodes in nodes array
        //                     obj = {};
        //                     obj.id = e[`${headerNames[0]}`];
        //                     node.push(e[`${headerNames[0]}`]);
        //                     nodes.push(obj);
        //                 }
        //                 if (!node.includes(e[`${headerNames[1]}`])) { // inserting node infos of target nodes in nodes array
        //                     obj = {};
        //                     obj.id = e[`${headerNames[1]}`];
        //                     node.push(e[`${headerNames[1]}`]);
        //                     nodes.push(obj);
        //                 }
        //                 if (e[`${headerNames[2]}`]) { // if weight is zero then there should be no connection so, this become false
        //                     obj2 = {};
        //                     obj2.source = node.indexOf(e[`${headerNames[0]}`]);
        //                     obj2.target = node.indexOf(e[`${headerNames[1]}`]);
        //                     obj2.weight = e[`${headerNames[2]}`];
        //                     links.push(obj2);
        //                 }
        //             }
        //             cb();
        //         }
        //     })
        // }, (err) => {
        //     console.log('DONE DANA DONE', node)
        // })
// =======================================================================================
        // console.log(headerNames);
        // result.forEach(e => {
        //     // console.log('=====>', e);
        //     let check9606_1 = e[`${headerNames[0]}`].split('9606.');
        //     let check9606_2 = e[`${headerNames[1]}`].split('9606.');
            
        //     if (check9606_1.length > 1) {
        //         e[`${headerNames[0]}`] = check9606_1[1];
        //     } else {
        //         e[`${headerNames[0]}`] = check9606_1[0];
        //     }

        //     if (check9606_2.length > 1) {
        //         e[`${headerNames[1]}`] = check9606_2[1];
        //     } else {
        //         e[`${headerNames[1]}`] = check9606_2[0];
        //     }
            
        //     if (e[`${headerNames[0]}`] != "#N/A" && e[`${headerNames[1]}`] != "#N/A" && e[`${headerNames[2]}`] != "#N/A") {
        //         // console.log('==>', e[`${headerNames[0]}`] == "#N/A", e[`${headerNames[1]}`] == "#N/A", e[`${headerNames[2]}`]);
        //         if (!node.includes(e[`${headerNames[0]}`])) { // inserting node infos of source nodes in nodes array
        //             obj = {};
        //             obj.id = e[`${headerNames[0]}`];
        //             node.push(e[`${headerNames[0]}`]);
        //             nodes.push(obj);
        //         }
        //         if (!node.includes(e[`${headerNames[1]}`])) { // inserting node infos of target nodes in nodes array
        //             obj = {};
        //             obj.id = e[`${headerNames[1]}`];
        //             node.push(e[`${headerNames[1]}`]);
        //             nodes.push(obj);
        //         }
        //         if (e[`${headerNames[2]}`]) { // if weight is zero then there should be no connection so, this become false
        //             obj2 = {};
        //             obj2.source = node.indexOf(e[`${headerNames[0]}`]);
        //             obj2.target = node.indexOf(e[`${headerNames[1]}`]);
        //             obj2.weight = e[`${headerNames[2]}`];
        //             links.push(obj2);
        //         }
        //     }
        //     // }
        // });
        // callback(null, { "directed": false, "graph": [], links: links, nodes: nodes })
    },

    // ============================================================ GET REST NODE ======================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    getRestNodeDetails: (arr1, jsn, callback) => {

        console.log(arr1);
        let ENSG_ARR = [];
        let ENSP_ARR = [];

        arr1.forEach(e => {
            ENSG_ARR.push(e);
        })
        Networks.getNodeExistDetailsSeries(ENSG_ARR, (err, resp) => {
            console.log('RESULTS', err, resp);
        });

        // arr1.forEach (e => {
        //     console.log('CHECKING', e, typeof(e));
        //     if (e != '#N/A' && e != 'N/A' && e != 'NA') {

        //         if (e.startsWith('ENSG')) {
        //             // ENSG_ARR.push({ ID: e });
        //             ENSG_ARR.push({ ENSG_ID: e })
        //         } else {
        //             ENSP_ARR.push(e)
        //         }
        //     }
        // })
        // mongo.connect(urlDB, { useUnifiedTopology: true }, function (err, client) {
        //     if (err) {
        //         callback(err);
        //     }
        //     // collectionName = collectionName;

        //     function findNodeSTRINGIDs(cb) {
        //         if (err) throw err;
        //         // collectionName = 'stringdb_nodes';
        //         // var db = client.db(`stringdb`);

        //         collectionName = 'PDNet_GRCH38p13';
        //         var db = client.db(`pd_net`);
    
        //         db.createCollection(collectionName, (err, resp) => {
        //             if (err) {
        //                 callback(err);
        //             } else {
        //                 let dbQueryArray = [];
        //                 let dbRespArr = [];
        //                 let dbRespObj = {}
        //                 let projectionObj = {};
        //                 projectionObj._id = 0;
        //                 // projectionObj.ENSP_ID = 1
        //                 // projectionObj.ENSG_GRCH38p13 = 1;

        //                 projectionObj.ENSG_ID = 1;

        //                 for (let i = 0; i < ENSP_ARR.length; i++) {
        //                     let arr = [{
        //                         ENSP_ID: ENSP_ARR[i]
        //                     }]
        //                     dbQueryArray =  dbQueryArray.concat(arr);
        //                 }


        //                 console.log('--FIND ENSG QUERY->', dbQueryArray);

        //                 let checkNotF = []
        //                 let dbresp = db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).stream();
        //                 dbresp.on('data', (data) => {
        //                     console.log("data->", data);
        //                     // dbRespArr.push({ ID: data.ENSG_GRCH38p13 })
        //                     // dbRespObj[`${data.ENSP_ID}`] = data.ENSG_GRCH38p13;
                            
        //                 })
        //                 dbresp.on('end', (data) => {
        //                     cb(dbRespArr, dbRespObj);
        //                 })
        //             }
        //         });
        //     }

        //     function findENSG_Details(arr, obj) {
        //         var db = client.db(`pd_net`);
        //         db.collection('pd_universal_data_dummy').find({ $or: arr }, { projection: { _id: 0, ID: 1, Gene_name: 1, Description: 1 } }).toArray((err, resp) => {
        //             if (err) {
        //                 callback(err);
        //             } else if (resp) {
        //                 // console.log(resp);
        //                 // resp.forEach(r => {
        //                 //     for (o in obj) {
        //                 //         if (obj[`${o}`] == r.ID) {
        //                 //             obj[`${o}`] = r;
        //                 //         }
        //                 //     }
        //                 // });
        //                 // // console.log('last', obj);
        //                 jsn.nodes.map(e => {
        //                     // if (obj.hasOwnProperty(e.id)) {
        //                     //     // console.log('last', obj[`${e.id}`], e.id);
        //                     //     e.label = obj[`${e.id}`].Gene_name;
        //                     //     e.Description = obj[`${e.id}`].Description;
        //                     // }
        //                     resp.forEach(r => {
        //                         if (r.ID == e.id) {
        //                             console.log(r);
        //                             e.label = r.Gene_name;
        //                             e.Description = r.Description;
        //                         }
        //                     })
        //                 });

        //                 jsn.nodes.forEach(j => {
        //                     if (j.label == undefined) {
        //                         console.log(j)
        //                     }
        //                 })

        //                 // let columnArr = Object.keys(resp);
        //                 // console.log('====JSON====>>>>>>>>>>', jsn)
        //                 callback(null, jsn);
        //             } else {
        //                 callback(null, false)
        //             }
        //         })
        //     }

        //     findNodeSTRINGIDs((ensg_arr, ensg_obj) => {
        //         let allENSGs = ensg_arr.concat(ENSG_ARR);
        //         // console.log('ENSG->', ensg_arr, ensg_obj);
        //         findENSG_Details(allENSGs, ensg_obj)
        //     })


        // });
    },
    // ================================================================================================================================

};