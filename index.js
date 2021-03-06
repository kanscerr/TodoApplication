//imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const model = require('./schema');

const app = express();
const PORT = 3000;

//connecting to database
mongoose.connect("mongodb://localhost:27017/tododb", {useNewUrlParser : true}, () => console.log('connected to database'))

//middleware
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true}));


//creating account 
app.post('/register', (req, res) => {
    //to find the last userId
    model.findOne().sort({userId : -1}).limit(1).exec((err, data)=> {  
        if(data){
            const newUser = new model({
                'userInfo.username' : req.body.username,
                'userInfo.email' : req.body.email,
                'userInfo.password' : req.body.password,
                userId : data.userId+1 //next userId
            }) 
            if(req.body.username && req.body.email && req.body.password){
                //for checking if the username is available
                //fixing required
                model.findOne(
                {'userInfo.username' : req.body.username}, 
                (error, result) => {
                    if(result == null){
                        const data = newUser.save();
                        res.json("Registered Successfully!")      
                    }
                    else{ 
                        let final = result.userInfo.username
                        if(final == req.body.username){
                        res.json("Username not valid!");
                    }}
                })
            }
            else{
                res.json("Not enough information!")
            }
        }
        else{
            const newUser = new model({
                'userInfo.username' : req.body.username,
                'userInfo.email' : req.body.email,
                'userInfo.password' : req.body.password,
                userId : 100 //for the first user
            }) 
            if(req.body.username && req.body.email && req.body.password){
                //to verify if username is available
                model.findOne({'userInfo.username' : req.body.username}, (error, result) => {
                    if(result == null){
                        const data = newUser.save();
                        res.json("Registered Successfully!");      
                    }
                    else{ 
                        let final = result.username
                        if(final == req.body.username){
                        res.json("Username not valid!");
                    }}
                })
            }
            else{
                res.json("Not enough information!")
            }
        }
    })
})

//logging in
app.post('/login', (req, res) => {
    if(req.body.actionInfo && req.body.formData){
        model.findOne(
            {'userInfo.username' : req.body.formData.username, 'userInfo.password' : req.body.formData.password},
            (error, result) => {
                if(result){
                    res.send(result);
                }
                else{
                    res.json({error : "Login credentials invalid!"})
                }
            }
        )
    }
})

//adding todo against a user
app.post('/addTodo', (req, res) => {
    let taskNumbers = [];
    if(req.body.actionInfo && req.body.formData){
        model.findOne(
            {userId : req.body.sessionData.userId},
            (error, result) => {
                if(result){
                    let data = result.formData
                    for (i=0;i<data.length;i++){
                        taskNumbers.push(data[i].taskNumber);
                    }
                    taskNumbers.sort((a,b) => b-a) //to display todos in ascending oder of taskNumber
                    if(taskNumbers.length>0){
                        const newData = {taskNumber: taskNumbers[0]+1, todo : req.body.formData.todo, isDeleted : false}
                        model.findOneAndUpdate(
                            {userId : req.body.sessionData.userId},
                            {$push : {formData : newData}},
                            function(error, result){
                                if(result){
                                    res.send(newData);
                                }
                                else{
                                    res.json("Oops! Something went wrong.")
                                }
                            }
                        )
                    }
                    else{
                        const newData = {taskNumber: 1, todo : req.body.formData.todo, isDeleted : false}
                        model.findOneAndUpdate(
                            {userId : req.body.sessionData.userId},
                            {$push : {formData : newData}},
                            function(error, result){
                                if(result){
                                    res.send(newData);
                                }
                                else{
                                    res.json("Oops! Something went wrong.");
                                }
                            }
                        )
                    }
                }
                else{
                    res.json("Invalid Unser!");
                }
            }
        )
    }
    else{
        res.json("Invalid information");
    }
})

//getting all todos of a user
app.post('/getAllTodo', (req, res) => {
    let todoArr = []
    if(req.body.actionInfo){
        model.findOne(
            {userId : req.body.sessionData.userId},
            (error, result) => {
                if(result){
                    let data = result.formData
                    for (i=0;i<data.length;i++){
                        if(data[i].isDeleted == false){
                            todoArr.push(data[i]);
                        }
                    }
                    todoArr.sort((a,b) => a.taskNumber-b.taskNumber) //to display todos in ascending oder of taskNumber
                    res.send(todoArr);
                }
                else{
                    res.send({error : 'Oops! Something went wrong.'})
                }
            }
        )
    }
    else if(req.body.sessionData.userId!=100){
        res.send({error : "User not valid"});
    }
    else{
        res.send({error : 'Not enough information'})
    }
})

//getting one todo against a user
app.post('/getOneTodo', (req, res) => {
    if(req.body.actionInfo && req.body.formData){
        model.findOne(
            {userId : req.body.sessionData.userId, 'formData.taskNumber' : req.body.formData.taskNumber},
            (error, result) => {
                if(result){
                    todoArr = result.formData
                    for(i=0;i<todoArr.length;i++){
                        //to check whether the task is deleted or not by user
                        if(todoArr[i].taskNumber==req.body.formData.taskNumber && todoArr[i].isDeleted == false){
                            res.send(todoArr[i]);
                            break
                        }
                        else if(todoArr[i].taskNumber==req.body.formData.taskNumber && todoArr[i].isDeleted == true){
                            res.send({error : "No such task available"});
                            break
                        }
                        else{
                            continue;
                        }
                    }
                }
                else{
                    res.send({error : 'No such task available'})
                }
            }
        )
    }
    else if(req.body.sessionData.userId!=100){
        res.send({error : "User not valid"});
    }
    else{
        res.send({error : 'Not enough information'});
    }
})

//delete a todo against a user
app.post('/deleteTodo', (req, res) => {
    if(req.body.actionInfo && req.body.formData){
        model.find(
            {userId : req.body.sessionData.userId, 'formData.taskNumber' : req.body.formData.taskNumber},
            (error, result) => {
                if(result){
                    model.findOneAndUpdate(
                        {userId : req.body.sessionData.userId, 'formData.taskNumber' : req.body.formData.taskNumber},
                        {$set : {'formData.$.isDeleted' : true}}, 
                        (error, result) => {
                            if(result){
                                res.send(result)
                            }
                            else{
                                res.send({error : "Oops! Something went wrong."})
                            }
                        }
                    )
                }
                else{
                    res.send({error : "No such task exists"})
                }
            }
        )
    }
    else if(req.body.sessionData.userId!=100){
        res.send({error : "User not valid"});
    }
    else{
        res.send({error : "Not enough information"});
    }
})

//updating a todo against a user
app.post('/updateTodo', (req, res) => {
    if(req.body.actionInfo && req.body.formData){
        model.findOne(
            {userid : req.body.sessionData.userid, 'formData.taskNumber' : req.body.formData.taskNumber},
            function(error, result){
                if(result){
                    data = result.formData
                    for(i=0;i<data.length;i++){
                        //to check if required is deleted or not
                        if(data[i].taskNumber==req.body.formData.taskNumber && data[i].isDeleted==false){
                            model.findOneAndUpdate(
                                {userid : req.body.sessionData.userId, 'formData.taskNumber' : req.body.formData.taskNumber},
                                {$set : {'formData.$.todo' : req.body.formData.todo}},
                                (error, result) => {
                                    if(result){
                                        res.json("Updated!");
                                    }
                                    else{
                                        res.json("Oops! Something went wrong.")
                                    }
                                }
                            )
                        }
                        else if(data[i].taskNumber==req.body.formData.taskNumber && data[i].isDeleted==true){
                            res.json("No such task available");
                        }
                        else{
                            continue;
                        }
                    }
                }
                else{
                    res.json("No such task available!");
                }
            }
        )
    }
    else if(req.body.sessionData.userId!=100){
        res.json("User not valid");
    }
    else{
        res.json("Not enough information!");
    }
})

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));