import restify        from 'restify';
import corsMiddleware from 'restify-cors-middleware';

(function main() {
    const app = restify.createServer({});
    const cors = corsMiddleware({});
    
    app.pre(cors.preflight);
    app.use(cors.actual);
    app.use(restify.plugins.bodyParser({mapParams: false}));
    
    app.get('/guestbook', ( req, res ) => {
        res.status(501);
        res.send({message: 'Not Implemented'});
    });
    
    app.post('/guestbook', ( req, res ) => {
        res.status(501);
        res.send({message: 'Not Implemented'});
    });
    
    app.get('/guestbook/:id', ( req, res ) => {
        res.status(501);
        res.send({message: 'Not Implemented'});
    });
    
    app.del('/guestbook/:id', ( req, res ) => {
        res.status(501);
        res.send({message: 'Not Implemented'});
    });
    
    app.listen(3000);
})();
