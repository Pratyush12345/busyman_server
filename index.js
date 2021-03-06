const express = require('express')
const twit = require('twit')
const axios  = require('axios')
const { response } = require('express')
const app = express()

const port = process.env.PORT || 3000

const twitterApi = new twit({
    consumer_key : "n58AlgPKH47GIWrmR3eH4vE8z" ,
    consumer_secret : "vomHhRkABsllgCPRuuqYw6DB5l3pjkBmTRIlAhpE09Mp7ktOSt",
    access_token : "620757286-BPZuCXML1SXbmyECresO1cqs7dDgmOBnB6PngoQO",
    access_token_secret : "kDaeOIFzfYDfBfetHad9TJgP2h2A0LZIjCkRMxuXTuf1P",
    timeout_ms : 60 * 1000
})

var stream

function fetchAllUserData(){
    axios.get('https://us-central1-busymen-f8267.cloudfunctions.net/restApiUser/getUserData').then((response)=>{
    let followList = ""
    let userList = [] 
    userList = response.data
    
    userList.forEach(element => {
        console.log(element.data.RetweetId)
            
        followList = followList + element.data.RetweetId 
        });
 
        
        if(followList==="")
        followList = "1"
        
        console.log(followList)  
 
        stream  = twitterApi.stream('statuses/filter', {
            follow: followList
        })
        
        stream.on('tweet', (tweet)=>{
          console.log("tweet captured") 
          console.log(tweet)
          
          userList.forEach(element => {
            console.log(element.data.RetweetId)
            console.log(tweet.user.id_str)
            if(element.data.RetweetId.includes(tweet.user.id_str)){
             console.log("Tweets equal")   
            var retweetCred = new twit({
                consumer_key : "n58AlgPKH47GIWrmR3eH4vE8z" ,
                consumer_secret : "vomHhRkABsllgCPRuuqYw6DB5l3pjkBmTRIlAhpE09Mp7ktOSt",
                access_token : element.data.AcessToken,
                access_token_secret : element.data.AcessTokenSecret,
                timeout_ms : 60 * 1000
            })

            retweetCred.post("statuses/retweet/:id",{
                id: tweet.id_str
                },
            
                (err, data, res)=>{
                    console.log("Retweeted");
                }
            )
            
            retweetCred.post("favorites/create",{
                id: tweet.id_str
                },
            
                (err, data, res)=>{
                    console.log("Retweeted");
                }
            )
            }
          });

          
         
        })  
        
        stream.on("disconnect", (disconnectmsg)=>{
          stream.start()
        })

        stream.on("warning", (warning)=>{
            stream.start()
          })
    })   
}

function crudoperation(){
    stream.stop()
    fetchAllUserData()
}

app.get("/", (req, res)=>{
    res.status(200).send("Hello From BusyMan");
})

app.get("/onUserCreate", (req, res)=>{
    console.log("New User Created")
    crudoperation()
    res.status(200).send("User Created");
})

app.get("/onUserDelete", (req, res)=>{
    console.log("User Deleted")
    stream.stop()
    res.status(200).send("User Deleted");
})

app.get("/onUserUpdate", (req, res)=>{
    console.log("User Updated")
    crudoperation()
    res.status(200).send("User Updated");
})

app.listen(port , (req, res)=>{
    fetchAllUserData()
    console.log("Server started and running on port 3000")
})