//importing
import express from "express";
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';
//app config
const app = express();
const port = process.env.PORT || 9000;
const pusher = new Pusher({
    appId: "1728575",
    key: "dc764bb960dbcf958e41",
    secret: "89367b041d97ba7de8d0",
    cluster: "ap2",
    useTLS: true
  });
//middleware
app.use(express.json());
app.use(cors());

//db config
const connection_url = "mongodb+srv://admin:sN_eha563248@cluster0.f4ugxvz.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(connection_url,{
    // useCreateIndex: true,
    useNewUrlParser:true,
    // useUnifiedTopology: true,

});
const db=mongoose.connection
db.once('open',()=>{
    console.log('DB connected');
    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();
    changeStream.on('change',(change)=>{
        console.log(change);
        if(change.operationType==='insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages','inserted',
            {
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                recieved:messageDetails.recieved,
            }
            );
        }else{
            console.log('Error triggering Pusher')
        }

    });

});
//api routes
app.get("/",(req,res)=>res.status(200).send('hello world'));

app.get('/messages/sync', (req, res) => {
    Messages.find()
      .then(data => {
        res.status(200).send(data);
      })
      .catch(err => {
        res.status(500).send(err);
      });
  });
  

app.post('/messages/new',(req,res)=>{
    const dbMessages=req.body
    Messages.create(dbMessages)
  .then(data => {
    res.status(201).send(data);
  })
  .catch(err => {
    res.status(500).send(err);
  });

})
//listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));
