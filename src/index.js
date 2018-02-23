import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';
import ip from 'ip';

const moment = require('moment');
const loki = require('lokijs');
const color = require('colors');

//database declaration
let db = new loki('loki.json');
let data = db.addCollection('data', {indices: ['id'], unique: ['id']});
data.ensureUniqueIndex('id');

//app initialization
const app = restify.createServer({});
const cors = corsMiddleware({});

//database helper
function loadCollection(colName, callback) {
    db.loadDatabase({}, () => {
        let _collection = db.getCollection(colName);
        if (!_collection) {
            console.log("Collection %s does not exit. Creating ...", colName);
            _collection = db.addCollection('users');
        }
        callback(_collection);
    });
}

//middleware
app.pre(cors.preflight);
app.use(cors.actual);
app.use(restify.plugins.bodyParser({mapParams: false}));

app.get('/guestbook', (req, res) => {
    res.header("Content-Type", 'application/json');
    let data = [];
    loadCollection('data', collection => {
        let col = collection.find({});
        col.forEach(obj => {
            if (!obj.hasOwnProperty('deleted_at')) data.push(obj);
        });
        if (data.length > 0) {
            res.status(200);
            res.send({data});
        } else {
            res.status(404);
            res.send({message: "No results returned from database"});
        }
    });
});

app.post('/guestbook', (req, res) => {
    let new_guestbook_object = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        message: req.body.message,
        created_at: moment().toISOString()
    };
    loadCollection('data', data => {
        let resultObj = data.insert(new_guestbook_object);
        resultObj.id = resultObj.$loki;
        data.update(resultObj);
        db.save();

        console.log(resultObj);
        res.status(201);
        res.send({
            data: {
                id: new_guestbook_object.id,
                created_at: new_guestbook_object.created_at
            }
        });
    });
});

app.get('/guestbook/:id', (req, res) => {
    res.header("Content-Type", 'application/json');
    loadCollection('data', data => {
        let result = data.findOne({id: parseInt(req.params.id)});

        console.log(color.green(`\n Requested id: ${req.params.id} \n`), result);
        if (result !== null && result.hasOwnProperty('deleted_at') === false) {
            res.status(200);
            res.send(
                {
                    data: {
                        id: result.id,
                        first_name: result.first_name,
                        last_name: result.last_name,
                        message: result.message,
                        created_at: result.created_at
                    }
                }
            );
        } else if (result === null || result.hasOwnProperty('deleted_at') === true) {
            res.status(404);
            res.send({message: "Entry not found"});
        }
    });
});

app.del('/guestbook/:id', (req, res) => {
    res.header("Content-Type", 'application/json');
    loadCollection('data', collection => {
        let requested_delete = collection.findOne({id: parseInt(req.params.id)});

        if (requested_delete !== null) {
            requested_delete.deleted_at = moment().toISOString();
            collection.update(requested_delete);
            db.save();
            res.status(200);
            res.send({
                data: {
                    id: requested_delete.id,
                    deleted_at: requested_delete
                }
            });
        } else if (requested_delete === null) {
            res.status(404);
            res.send({data: {message: "Entry not found"}});
        }
    });
});

const port = (process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Local               https://localhost:${port}/guestbook`);
    console.log(`On Your Network:    https://${ip.address()}:${port}/guestbook`);
});


