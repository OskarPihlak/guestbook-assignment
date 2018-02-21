import restify from 'restify';
import corsMiddleware from 'restify-cors-middleware';
import ip from 'ip';

const moment = require('moment');
const loki = require('lokijs');

//database
let db = new loki('loki.json');
let data = db.addCollection('data', {indices: ['id'], unique: ['id']});
data.ensureUniqueIndex('id');

//app initialization
const app = restify.createServer({});
const cors = corsMiddleware({});

//middleware
app.pre(cors.preflight);
app.use(cors.actual);
app.use(restify.plugins.bodyParser({mapParams: false}));

app.get('/guestbook', (req, res) => {
    res.header("Content-Type", 'application/json');
    db.loadDatabase({}, () => {
        let all_data = db.getCollection('data');
        let data = all_data.find({});
        res.status(200);
        res.json({data});
    });
});

app.post('/guestbook', (req, res) => {
    let new_guestbook_object = {
        first_name: req.body.first_name,    //first_name
        last_name: req.body.last_name,     //last_name
        message: req.body.message,       //message
        created_at: moment().toISOString()  //created
    };

    let resultObj = data.insert(new_guestbook_object);
    resultObj.id = resultObj.$loki;
    data.update(resultObj);
    db.save();

    console.log(resultObj);

    res.status(201);
    res.send({
        id: new_guestbook_object.id,
        created_at: new_guestbook_object.created_at
    });
});

app.get('/guestbook/:id', (req, res) => {
    res.header("Content-Type", 'application/json');
    db.loadDatabase({}, () => {
        let all_data = db.getCollection('data');
        let result = all_data.findOne({id: parseInt(req.params.id)});

        console.log(result !== null && result.hasOwnProperty('deleted_at') === false);
        if (result !== null && result.hasOwnProperty('deleted_at') === false) {
            console.log(result);
            console.log(result.hasOwnProperty('deleted_at') === false);
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
            res.send({message: "Not Found"});
        }
    });
});

app.del('/guestbook/:id', (req, res) => {
    res.header("Content-Type", 'application/json');
    db.loadDatabase({}, () => {
        let all_data = db.getCollection('data');
        let requested_delete = all_data.findOne({id: parseInt(req.params.id)});

        if (requested_delete !== null) {
            requested_delete.deleted_at = moment().toISOString();
            all_data.update(requested_delete);
            db.save();
            res.status(200);
            res.send({
                data: {
                    id: requested_delete.id,
                    deleted_at: requested_delete
                }
            });

        } else if (requested_delete === null) {
            res.header("Content-Type", 'application/json');
            res.status(404);
            res.send({message: "Not Found"});
        }
    });
});


const port = (process.env.PORT) || 3000;
app.listen(port, () => {
    console.log(`Local               https://localhost:${port}/guestbook`);
    console.log(`On Your Network:    https://${ip.address()}:${port}/guestbook`);
});


