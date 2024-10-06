const express=require('express')
const cors= require('cors')
const port =process.env.PORT || 5000;
require ('dotenv').config()
const app=express()
app.use(cors())
app.use(express.json())



// socket io implementaion
const http= require("http");
const {Server}=require("socket.io")
const server=http.createServer(app)
const io=new Server(server,{
  cors:{
    oringin: "https://werewolf-back-end.vercel.app/",
    methods:["GET","POST","PUT","DELETE"]
  }
})




const { MongoClient, ServerApiVersion } = require('mongodb');
const exp = require('constants');
const uri = `mongodb+srv://WareWolf:${process.env.DB_PASS}@cluster0.ravtcpm.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db=client.db("Warewolf");
    const lobbyCollection=db.collection("lobbyCollection");

    
    // creating new lobby
    app.post('/lobby',async(req,res)=>{

  
    const body=req.body
  
    const allLobbies= await lobbyCollection.find({}).toArray()

    for(i=0;i<=allLobbies.length;i++){
     if(allLobbies[i]?.email==body.email){
       res.send({msg:'lobby exists'})
       break;
      }
      else{
        const result= await lobbyCollection.insertOne(body)
        res.send({msg:'lobby created'})
      }
    }


  
      })


      
    app.post("/join/:lobby",async (req,res)=>{

      const lobbyName=req.params.lobby
      // const currentLobby=await lobbyCollection.find({}).toArray()
      const body=req.body;
      const mainBody=body.body
      const result=lobbyCollection.updateOne({name:lobbyName},
        {
          $push: {
                   "lobbyPlayers": body
                              
                  }
         }
)
      res.send(result)

    })


    app.post("/chat/:lobby",async (req,res)=>{

      const lobbyName=req.params.lobby
      // const currentLobby=await lobbyCollection.find({}).toArray()
      const body=req.body;
      const mainBody=body.body
      const result=lobbyCollection.updateOne({name:lobbyName},
        {
          $push: {
                   "chat": body
                              
                  }
         }
)
      res.send(result)

    })


    // socket io integration
io.on("connection",(socket)=>{
  console.log('User Connected')

  // takes the joining code for lobbies to see who are currently in lobby to create a a backend room among them
  socket.on("join room",(data)=>{
    socket.join(data.room)
    console.log(data.room)
  })
  // for emiting any action from front end to back end
  socket.on("action taken",(data)=>{
    socket.to(data.room).emit("action taken",data)
    console.log(data.action)
  })

})

app.get('/lobbydata/:lobbyName',async(req,res)=>{

  const lobbyName=req.params.lobbyName
  const lobbyData=await lobbyCollection.find({name:lobbyName}).toArray()

  res.send(lobbyData)

})


  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);







app.get('/',(req,res)=>{
    res.send("simple crud is running")
})


// app.listen(port,()=>{
//     console.log('server is running on port 5000')
// })



// must have this for soket io to work

server.listen(port,()=>{
  console.log('server is running on port 5000')
})