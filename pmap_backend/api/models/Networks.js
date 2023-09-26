/**
 * Networks.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
let mongo = sails.config.globals.MongoClient;
let mongoURL = sails.config.globals.mongourl;
assert = require('assert');
let fs = require('file-system');
const {
    log, Console
} = require('console');

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

    testMongo: (userGivenNodeNames, channel, score, order, callback) => {
        unsetArr = [];
        unsetArr1 = [
            "_id",
            "neighborhood",
            "fusion",
            "cooccurence",
            "coexpression",
            "experimental",
            "database",
            "textmining",
            "combined_score"
        ];
        unsetArr1.splice(unsetArr1.indexOf(channel));
        unsetArr1.map(e => {
            unsetArr.push('proteinDescription.' + e);
        })


        // console.log('unsetArr', unsetArr);

        userNodesAre = userGivenNodeNames;

        function findNodes(nodeNames, cb) {
            let proteinDescriptionObj = {
                protein1: 1,
                protein2: 1
            }
            proteinDescriptionObj[`${channel}`] = 1;
            // proteinDescriptionObj.$filter = {
            //     input: "$proteinDescription",
            //     as: "pd",
            //     cond: { $gte: [ "$$proteinDescription.combined_score", 0.3 ] }
            //  }
            sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, {
                useUnifiedTopology: true
            }, function (err, client) {
                if (err) throw err;
                collectionName = 'stringdb_nodes_updated';
                var db = client.db(`stringdb`);

                db.createCollection(collectionName, (err, resp) => {
                    if (err) {
                        callback(err);
                    } else {
                        let geneArray = [];
                        nodeNames.forEach(e => {
                            obj = {
                                string_ID: e
                            }
                            geneArray.push(obj);
                        })
                        // console.log('gene', geneArray);
                        let agg1 = [{
                            '$match': {
                                '$or': geneArray
                            }
                        },
                        {
                            '$lookup': {
                                from: 'stringdb_universal_data',
                                localField: 'string_ID',
                                foreignField: 'protein1',
                                as: 'proteinDescription'
                            },
                        }, {
                            $project: {
                                _id: 0,
                                proteinDescription: {
                                    $filter: {
                                        input: "$proteinDescription",
                                        as: "pd",
                                        cond: { $gte: [`$$pd.${channel}`, score] }
                                    }
                                }
                            }
                        }, {
                            $unset: unsetArr
                        }
                        ]
                        console.log('AGGREGATION STARTS')
                        var start = (new Date).getTime();
                        let x = db.collection(collectionName).aggregate(agg1).stream();

                        resultFinal = []
                        var diff = (new Date).getTime() - start;

                        console.log('AGGREGATION ENDS in', diff / 1000, 'seconds')

                        var start1 = (new Date).getTime();
                        console.log('DATA TO ARRAY STARTS')

                        let i = 0;
                        x.on("data", function (data) {
                            resultFinal.push(data);
                            console.log('=>', ++i);
                        });

                        x.on("end", function (data) {
                            var diff1 = (new Date).getTime() - start1;
                            console.log('DATA TO ARRAY ENDS in', diff1 / 1000, 'seconds')
                            // console.log(`TOTAL NODES, ${resultFinal.length + nodeNames.length}, TOTAL LINKS ${resultFinal.length}`)

                            let node = [];
                            let dbCallNodes = []
                            // let links = [];
                            // let nodes = [];
                            var start2 = (new Date).getTime();
                            console.log('START MAPPING')

                            resultFinal.forEach(e => {
                                e.proteinDescription.forEach(ee => {
                                    if (!node.includes(ee.protein1)) { // inserting node infos of source nodes in nodes array
                                        node.push(ee.protein1);
                                        dbCallNodes.push({
                                            string_ID: ee.protein1
                                        })
                                    }
                                    if (!node.includes(ee.protein2)) { // inserting node infos of target nodes in nodes array
                                        node.push(ee.protein2);
                                        dbCallNodes.push({
                                            string_ID: ee.protein2
                                        })
                                    }
                                });
                            });

                            var diff2 = (new Date).getTime() - start2;
                            console.log('END MAPPING,', diff2 / 1000, 'seconds,', 'nodes:', node.length);
                            // console.log(node)
                            cb(node);
                        });
                    }
                });
            });
        }

        function findEdges(totalNodes, totalNodesDetails, totalNodesDetailss) {
            console.log('DB QUERY PAIR STARTED', totalNodes);
            let start = (new Date).getTime();
            dbQueryArray = []
            for (let i = 0; i < totalNodes.length - 1; i++) {
                for (let j = i + 1; j < totalNodes.length; j++) {
                    obj = { protein1: totalNodes[i], protein2: totalNodes[j] }
                    dbQueryArray.push(obj);
                }
            }
            let diff = (new Date).getTime() - start;
            console.log('PAIRING ENDS', diff / 1000, 'seconds,', 'Pair length:', dbQueryArray.length)

            sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function (err, client) {
                if (err) throw err;
                collectionName = 'stringdb_universal_data';
                var db = client.db(`stringdb`);

                db.createCollection(collectionName, (err, resp) => {
                    if (err) {
                        callback(err);
                    } else {
                        let dbRespArr = [];
                        let projectionObj = {};
                        projectionObj._id = 0;
                        projectionObj.protein1 = 1;
                        projectionObj.protein2 = 1;
                        projectionObj[`${channel}`] = 1;
                        console.log('PROJECT OBJ', projectionObj);
                        // db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).toArray((err, resp) => {
                        //     console.log(err, resp);
                        // })
                        let dbresp = db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).stream();
                        dbresp.on('data', (data) => {
                            // console.log(data);
                            // if (data[`${channel}`] >= score) {
                            dbRespArr.push(data)
                            // }
                        })
                        dbresp.on('end', (data) => {
                            // callback(null, dbRespArr);
                                console.log('dbRespArr======>>>>>>', dbRespArr);

                            let node = [];
                            let dbCallNodes = []
                            let links = [];
                            let nodes = [];
                            let start = (new Date).getTime();
                            console.log('START FORMING D3 Object')

                            dbRespArr.forEach(e => {
                                if (true) {
                                    if (!node.includes(e.protein1)) { // inserting node infos of source nodes in nodes array
                                        node.push(e.protein1);
                                        dbCallNodes.push({
                                            string_ID: e.protein1
                                        })
                                    }
                                    if (!node.includes(e.protein2)) { // inserting node infos of target nodes in nodes array
                                        node.push(e.protein2);
                                        dbCallNodes.push({
                                            string_ID: e.protein2
                                        })
                                    }
                                    if (e[`${channel}`] > 0 && e[`${channel}`] >= score) { // if weight is zero then there should be no connection so, this become false
                                        let obj2 = {};
                                        obj2.source = node.indexOf(e.protein1);
                                        obj2.target = node.indexOf(e.protein2);
                                        obj2.weight = e[`${channel}`];
                                        links.push(obj2);
                                    }
                                }

                            });
                            // console.log('dbCallNodes', dbCallNodes)
                            let dbCallNodesToObj = {};
                            let z = db.collection('stringdb_nodes_updated').find({
                                $or: dbCallNodes
                            }, {
                                projection: {
                                    _id: 0,
                                    Gene_Name: 1,
                                    string_ID: 1,
                                    ENSG_GRCH38p13: 1,
                                    Description: 1
                                }
                            })
                            z.on('data', (e) => {
                                dbCallNodesToObj[`${e.string_ID}`] = { label: e.Gene_Name, id: e.ENSG_GRCH38p13, Description: e.Description }
                            })
                            z.on('end', (e) => {
                                node.forEach(x => {
                                    nodes.push({ id: dbCallNodesToObj[`${x}`].id, label: dbCallNodesToObj[`${x}`].label, Description: dbCallNodesToObj[`${x}`].Description })
                                })

                                let yy = _.pluck(nodes, 'id');
                                for (let key in totalNodesDetails) {
                                    if (yy.includes(key) == false) {
                                        // console.log("==1==", totalNodesDetails[key]);
                                        nodes.push({ id: key, label: totalNodesDetails[key].Gene_Name, Description: totalNodesDetails[key].Description })
                                    }
                                }
                                if (totalNodesDetailss != undefined) {
                                    for (let key in totalNodesDetailss) {
                                        if (yy.includes(key) == false) {
                                            // console.log("==2==", totalNodesDetailss[key]);
                                            nodes.push({ id: key, label: totalNodesDetailss[key].Gene_Name, Description: totalNodesDetailss[key].Description });
                                        }
                                    }
                                }

                                let diff = (new Date).getTime() - start;
                                console.log('D3 Object Mapping Ends', diff / 1000, 'seconds, ', 'NODES', nodes.length, ', Links', links.length, '\n\n')
                                callback(null, {
                                    "directed": false,
                                    "graph": [],
                                    links: links,
                                    nodes: nodes
                                })

                            })

                        })
                    }
                });
            });
        }

        function findNodeSTRINGIDs(n, cb) {
            if (n != undefined) {
                userGivenNodeNames = n;
            }
            // console.log('usergiven', userGivenNodeNames)
            sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function (err, client) {
                if (err) throw err;
                collectionName = 'stringdb_nodes_updated';
                var db = client.db(`stringdb`);

                db.createCollection(collectionName, (err, resp) => {
                    if (err) {
                        callback(err);
                    } else {
                        let dbQueryArray = [];
                        let dbRespArr = [];
                        let dbRespArrDetails = {};
                        let projectionObj = {};
                        projectionObj._id = 0;
                        projectionObj.string_ID = 1;
                        projectionObj.ENSG_GRCH38p13 = 1;
                        // projectionObj.Indexed_ID = 1;
                        projectionObj.Gene_Name = 1;
                        projectionObj.Description = 1;

                        for (let i = 0; i < userGivenNodeNames.length; i++) {
                            let arr = [{
                                Gene_Name: userGivenNodeNames[i]
                            }, {
                                ENSG_GRCH38p13: userGivenNodeNames[i]
                            },
                            // {
                            //     Indexed_ID: userGivenNodeNames[i]
                            // },
                            {
                                ENSP_ID: userGivenNodeNames[i]
                            }, {
                                string_ID: userGivenNodeNames[i]
                            }]
                            dbQueryArray = dbQueryArray.concat(arr);
                        }


                        console.log('->', dbQueryArray);

                        let checkNotF = []
                        let dbresp = db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).stream();
                        dbresp.on('data', (data) => {
                            // checkNotF.push(data.Gene_Name)
                            // dbRespArrDetails[data.Indexed_ID] = { Gene_Name: data.Gene_Name, Description: data.Description };
                            dbRespArrDetails[data.ENSG_GRCH38p13] = { Gene_Name: data.Gene_Name, Description: data.Description };
                            dbRespArr.push(data.string_ID)
                            // dbRespArr.push(data.Gene_Name) // Gene Names Purpose
                        })
                        dbresp.on('end', (data) => {
                            cb(dbRespArr, dbRespArrDetails);
                        })
                    }
                });
            });
        }

        if (order == 1) {
            findNodeSTRINGIDs(undefined, (foundNodes, allNodesDetails) => {
                findNodes(foundNodes, (allNodes) => {
                    findNodeSTRINGIDs(allNodes, (allNodess, allNodessDetails) => {
                        findEdges(allNodess, allNodessDetails, allNodesDetails)
                    });
                })
            })
        } else {
            findNodeSTRINGIDs(undefined, (allNodes, allNodesDetails) => {
                findEdges(allNodes, allNodesDetails, undefined);
            });
        }
    },

    // ============================================== FIND NODES EXISTS ===============================================================

    getNodeExistDetailsSeries: (userGivenNodeNames, callback) => {
        // function findNodeSTRINGIDs(n, cb) {
        // if (n != undefined) {
        //     userGivenNodeNames = n;
        // }
        // console.log('usergiven', userGivenNodeNames)
        sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function (err, client) {
            if (err) throw err;
            var db = client.db(`pd_net`);
            collectionName = 'PDNet_GRCH38p13';

            db.createCollection(collectionName, (err, resp) => {
                if (err) {
                    callback(err);
                } else {
                    let dbQueryArray = [];
                    let finalResp = [];
                    let projectionObj = {};
                    projectionObj._id = 0;

                    for (let i = 0; i < userGivenNodeNames.length; i++) {
                        let arr = [{
                            SYMBOL: userGivenNodeNames[i]
                        }, {
                            Alias: { $regex: `,${userGivenNodeNames[i]},` }
                        }, {
                            ENSG_ID: userGivenNodeNames[i]
                        }]
                        dbQueryArray.push(arr);
                    }

                    let checkNotF = []
                    async.eachSeries(dbQueryArray, (dbq, cb) => {
                        let obj = {};
                        obj[dbq[0].SYMBOL] = "";
                        let dbresp = db.collection(collectionName).find({ $or: dbq }, { projection: projectionObj }).stream();

                        let i = 0;
                        let result = [];
                        let resultz = "";

                        dbresp.on('data', (data) => {
                            let x = data.Alias.split(',');
                            x.splice(0, 1)
                            x.splice(x.length - 1, 1);
                            data.Alias = x.join(', ');

                            result.push(data);
                        })
                        dbresp.on('end', (data) => {
                            obj[dbq[0].SYMBOL] = result;
                            finalResp.push(obj);
                            cb()
                        })
                    }, (err) => {
                        callback(null, finalResp);
                    })

                }
            });
        });
        // }
    },

    getNodeExistDetailsParallel: (userGivenNodeNames, callback) => {
        sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function (err, client) {
            if (err) throw err;
            var db = client.db(`pd_net`);
            collectionName = 'PDNet_GRCH38p13';

            db.createCollection(collectionName, (err, resp) => {
                if (err) {
                    callback(err);
                } else {
                    let dbQueryArray = [];
                    let finalResp = [];
                    let projectionObj = {};
                    projectionObj._id = 0;

                    console.log('userGivenNodeNames', userGivenNodeNames.length)
                    for (let i = 0; i < userGivenNodeNames.length; i++) {
                        // let arr = [{
                        //     SYMBOL: userGivenNodeNames[i]
                        // }, {
                        //     Alias: { $regex: `,${userGivenNodeNames[i]},` }
                        // }, {
                        //     ENSG_ID: userGivenNodeNames[i]
                        // }]

                        // dbQueryArray.push({
                        //     SYMBOL: userGivenNodeNames[i]
                        // });
                        // dbQueryArray.push({
                        //     Alias: { $regex: `,${userGivenNodeNames[i]},` }
                        // });
                        dbQueryArray.push({
                            ENSG_ID: userGivenNodeNames[i]
                        });
                    }

                    let checkNotF = []
                    let dbresp = db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).stream();
                    let result = [];
                    resultobj = {}

                    dbresp.on('data', (data) => {
                        // result.push(data);
                        resultobj[data.ENSG_ID] = data;
                    })

                    dbresp.on('end', (data) => {
                        // console.log('praller', resultobj)
                        userGivenNodeNames.forEach(e => {
                            if (resultobj.hasOwnProperty(e) == false) {
                                resultobj[e] = null;
                            }
                        })
                        callback(null, resultobj);
                    })

                }
            });
        });
        // }
    },

    // ============================================== FIND NODES EXISTS ENDS ==========================================================

    // ================================================================================================================================
    getUniversalData: (arr, collectionName, dbs, callback) => {
        mongo.connect(mongoURL, { useUnifiedTopology: true }, function (err, client) {
            if (err) {
                callback(err);
            }
            var db = client.db(dbs);

            cursor = db.collection(collectionName).find({ $or: arr }, { projection: { _id: 0 } }).stream();
            let response = []
            cursor.on('data', (data) => {
                // console.log('--->', data);
                response.push(data);
            })

            cursor.on('end', (data) => {
                let finalResp = {};
                finalResp.genes = {};
                finalResp.headers = {};
                i = 0;
                for (key in response[0]) {
                    finalResp.headers[`${key}`] = i;
                    i++;
                }
                response.forEach(r => {
                    finalResp.genes[`${r.ID}`] = [];
                    for (o in r) {
                        finalResp.genes[`${r.ID}`].push(r[o]);
                    }
                })
                callback(null, finalResp);
            })
        });
    },
    //============================================ CREATE NEIGHBOUR NODES ======================================================

    createNeighbours: (userGivenNodeNames, channel, score, order, callback) => {
        unsetArr = [];
        unsetArr1 = [
            "_id",
            "neighborhood",
            "fusion",
            "cooccurence",
            "coexpression",
            "experimental",
            "database",
            "textmining",
            "combined_score"
        ];
        unsetArr1.splice(unsetArr1.indexOf(channel));
        unsetArr1.map(e => {
            unsetArr.push('proteinDescription.' + e);
        })


        // console.log('unsetArr', unsetArr);

        userNodesAre = userGivenNodeNames;

        function findNodes(nodeNames, cb) {
            let proteinDescriptionObj = {
                protein1: 1,
                protein2: 1
            }
            proteinDescriptionObj[`${channel}`] = 1;
            // proteinDescriptionObj.$filter = {
            //     input: "$proteinDescription",
            //     as: "pd",
            //     cond: { $gte: [ "$$proteinDescription.combined_score", 0.3 ] }
            //  }
            sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, {
                useUnifiedTopology: true
            }, function (err, client) {
                if (err) throw err;
                collectionName = 'stringdb_nodes_updated';
                var db = client.db(`stringdb`);

                db.createCollection(collectionName, (err, resp) => {
                    if (err) {
                        callback(err);
                    } else {
                        let geneArray = [];
                        nodeNames.forEach(e => {
                            obj = {
                                string_ID: e
                            }
                            geneArray.push(obj);
                        })
                        // console.log('gene', geneArray);
                        let agg1 = [{
                            '$match': {
                                '$or': geneArray
                            }
                        },
                        {
                            '$lookup': {
                                from: 'stringdb_universal_data',
                                localField: 'string_ID',
                                foreignField: 'protein1',
                                as: 'proteinDescription'
                            },
                        }, {
                            $project: {
                                _id: 0,
                                proteinDescription: {
                                    $filter: {
                                        input: "$proteinDescription",
                                        as: "pd",
                                        cond: { $gte: [`$$pd.${channel}`, score] }
                                    }
                                }
                            }
                        }, {
                            $unset: unsetArr
                        }
                        ]
                        console.log('AGGREGATION STARTS')
                        var start = (new Date).getTime();
                        let x = db.collection(collectionName).aggregate(agg1).stream();

                        resultFinal = []
                        var diff = (new Date).getTime() - start;

                        console.log('AGGREGATION ENDS in', diff / 1000, 'seconds')

                        var start1 = (new Date).getTime();
                        console.log('DATA TO ARRAY STARTS')

                        let i = 0;
                        x.on("data", function (data) {
                            resultFinal.push(data);
                            console.log('=>', ++i);
                        });

                        x.on("end", function (data) {
                            var diff1 = (new Date).getTime() - start1;
                            console.log('DATA TO ARRAY ENDS in', diff1 / 1000, 'seconds')
                            // console.log(`TOTAL NODES, ${resultFinal.length + nodeNames.length}, TOTAL LINKS ${resultFinal.length}`)

                            let node = [];
                            let dbCallNodes = []
                            // let links = [];
                            // let nodes = [];
                            var start2 = (new Date).getTime();
                            console.log('START MAPPING')

                            resultFinal.forEach(e => {
                                e.proteinDescription.forEach(ee => {
                                    if (!node.includes(ee.protein1)) { // inserting node infos of source nodes in nodes array
                                        node.push(ee.protein1);
                                        dbCallNodes.push({
                                            string_ID: ee.protein1
                                        })
                                    }
                                    if (!node.includes(ee.protein2)) { // inserting node infos of target nodes in nodes array
                                        node.push(ee.protein2);
                                        dbCallNodes.push({
                                            string_ID: ee.protein2
                                        })
                                    }
                                });
                            });

                            var diff2 = (new Date).getTime() - start2;
                            console.log('END MAPPING,', diff2 / 1000, 'seconds,', 'nodes:', node.length);
                            // console.log(node)
                            cb(node);
                        });
                    }
                });
            });
        }

        function findEdges(totalNodes, totalNodesDetails, totalNodesDetailss) {
            console.log('DB QUERY PAIR STARTED');
            let start = (new Date).getTime();
            dbQueryArray = []
            for (let i = 0; i < totalNodes.length - 1; i++) {
                for (let j = i + 1; j < totalNodes.length; j++) {
                    obj = { protein1: totalNodes[i], protein2: totalNodes[j] }
                    dbQueryArray.push(obj);
                }
            }
            let diff = (new Date).getTime() - start;
            console.log('PAIRING ENDS', diff / 1000, 'seconds,', 'Pair length:', dbQueryArray.length)

            sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function (err, client) {
                if (err) throw err;
                collectionName = 'stringdb_universal_data';
                var db = client.db(`stringdb`);

                db.createCollection(collectionName, (err, resp) => {
                    if (err) {
                        callback(err);
                    } else {
                        let dbRespArr = [];
                        let projectionObj = {};
                        projectionObj._id = 0;
                        projectionObj.protein1 = 1;
                        projectionObj.protein2 = 1;
                        projectionObj[`${channel}`] = 1;
                        console.log('PROJECT OBJ', projectionObj);
                        // db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).toArray((err, resp) => {
                        //     console.log(err, resp);
                        // })
                        let dbresp = db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).stream();
                        dbresp.on('data', (data) => {
                            // console.log(data);
                            // if (data[`${channel}`] >= score) {
                            dbRespArr.push(data)
                            // }
                        })
                        dbresp.on('end', (data) => {
                            // callback(null, dbRespArr);

                            let node = [];
                            let dbCallNodes = []
                            let links = [];
                            let nodes = [];
                            let start = (new Date).getTime();
                            console.log('START FORMING D3 Object')

                            dbRespArr.forEach(e => {
                                if (true) {
                                    if (!node.includes(e.protein1)) { // inserting node infos of source nodes in nodes array
                                        node.push(e.protein1);
                                        dbCallNodes.push({
                                            string_ID: e.protein1
                                        })
                                    }
                                    if (!node.includes(e.protein2)) { // inserting node infos of target nodes in nodes array
                                        node.push(e.protein2);
                                        dbCallNodes.push({
                                            string_ID: e.protein2
                                        })
                                    }
                                    if (e[`${channel}`] > 0 && e[`${channel}`] > score) { // if weight is zero then there should be no connection so, this become false
                                        let obj2 = {};
                                        obj2.source = node.indexOf(e.protein1);
                                        obj2.target = node.indexOf(e.protein2);
                                        obj2.weight = e[`${channel}`];
                                        links.push(obj2);
                                    }
                                }

                            });
                            // console.log('dbCallNodes', dbCallNodes)
                            let dbCallNodesToObj = {};
                            let z = db.collection('stringdb_nodes_updated').find({
                                $or: dbCallNodes
                            }, {
                                projection: {
                                    _id: 0,
                                    Gene_Name: 1,
                                    string_ID: 1,
                                    ENSG_GRCH38p13: 1
                                }
                            })
                            z.on('data', (e) => {
                                dbCallNodesToObj[`${e.string_ID}`] = { label: e.Gene_Name, id: e.ENSG_GRCH38p13 }
                            })
                            z.on('end', (e) => {
                                node.forEach(x => {
                                    nodes.push({ id: dbCallNodesToObj[`${x}`].id, label: dbCallNodesToObj[`${x}`].label })
                                })

                                let yy = _.pluck(nodes, 'id');
                                for (let key in totalNodesDetails) {
                                    if (yy.includes(key) == false) {
                                        console.log("==1==", totalNodesDetails[key]);
                                        nodes.push({ id: key, label: totalNodesDetails[key] })
                                    }
                                }
                                if (totalNodesDetailss != undefined) {
                                    for (let key in totalNodesDetailss) {
                                        if (yy.includes(key) == false) {
                                            console.log("==2==", totalNodesDetailss[key]);
                                            nodes.push({ id: key, label: totalNodesDetailss[key] })
                                        }
                                    }
                                }

                                let diff = (new Date).getTime() - start;
                                console.log('D3 Object Mapping Ends', diff / 1000, 'seconds, ', 'NODES', nodes.length, ', Links', links.length, '\n\n')
                                callback(null, {
                                    "directed": false,
                                    "graph": [],
                                    links: links,
                                    nodes: nodes
                                })

                            })

                        })
                    }
                });
            });
        }

        function findNodeSTRINGIDs(n, cb) {
            if (n != undefined) {
                userGivenNodeNames = n;
            }
            // console.log('usergiven', userGivenNodeNames)
            sails.config.globals.MongoClient.connect(sails.config.globals.mongourl, { useUnifiedTopology: true }, function (err, client) {
                if (err) throw err;
                collectionName = 'stringdb_nodes_updated';
                var db = client.db(`stringdb`);

                db.createCollection(collectionName, (err, resp) => {
                    if (err) {
                        callback(err);
                    } else {
                        let dbQueryArray = [];
                        let dbRespArr = [];
                        let dbRespArrDetails = {};
                        let projectionObj = {};
                        projectionObj._id = 0;
                        projectionObj.string_ID = 1;
                        projectionObj.Indexed_ID = 1;
                        projectionObj.Gene_Name = 1;

                        for (let i = 0; i < userGivenNodeNames.length; i++) {
                            let arr = [{
                                Gene_Name: userGivenNodeNames[i]
                            }, {
                                ENSG_GRCH38p13: userGivenNodeNames[i]
                            }, {
                                Indexed_ID: userGivenNodeNames[i]
                            }, {
                                ENSP_ID: userGivenNodeNames[i]
                            }, {
                                string_ID: userGivenNodeNames[i]
                            }]
                            dbQueryArray = dbQueryArray.concat(arr);
                        }


                        console.log('->', dbQueryArray);

                        let checkNotF = []
                        let dbresp = db.collection(collectionName).find({ $or: dbQueryArray }, { projection: projectionObj }).stream();
                        dbresp.on('data', (data) => {
                            // console.log(data);
                            // checkNotF.push(data.Gene_Name)
                            dbRespArrDetails[data.Indexed_ID] = data.Gene_Name
                            dbRespArr.push(data.string_ID)
                            // dbRespArr.push(data.Gene_Name) // Gene Names Purpose
                        })
                        dbresp.on('end', (data) => {
                            cb(dbRespArr, dbRespArrDetails);
                        })
                    }
                });
            });
        }

        if (order == 1) {
            findNodeSTRINGIDs(undefined, (foundNodes, allNodesDetails) => {
                let noddddd1 = []
                for (let key in allNodesDetails) {
                    noddddd1.push(key);
                }
                findNodes(foundNodes, (allNodes) => {
                    findNodeSTRINGIDs(allNodes, (allNodess, allNodessDetails) => {
                        console.log('-=-=-=-=-=-', allNodess, allNodessDetails);
                        let noddddd = [];
                        // let noddddd2 = [];
                        let noddddd2 = "";

                        for (let key in allNodessDetails) {
                            noddddd.push(key);
                        }
                        for (let key in allNodessDetails) {
                            noddddd2 += allNodessDetails[key] + ',';
                        }
                        noddddd1.forEach(e => {
                            if (noddddd.includes(e) == false) {
                                noddddd2 += allNodesDetails[e] + ',';
                            }
                        })
                        console.log('DONE & total nodes ->', noddddd2.length)
                        // fs.writeFile(`./${noddddd2.length}_nodes_from_ensg.txt`, noddddd2, (err, resp) => { });
                        callback(null, {
                            data: noddddd2.substring(0, noddddd2.length - 1),
                            name: `${noddddd2.length}_neighbours_found.txt`
                        });
                    });
                })
            })
        } else {
            findNodeSTRINGIDs(undefined, (allNodes, allNodesDetails) => {
                findEdges(allNodes, allNodesDetails, undefined);
            });
        }
    },

};