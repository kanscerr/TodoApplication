const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const model = require('./schema');

const app = express();
const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/tododb", {useNewUrlParser : true}, () => console.log('connected to database'))

app.use(bodyParser.json())


//creating account 
app.post('/', (req, res) => {
    const newAccount = new model({
        userId : req.body.userId,
        username : req.body.username
    })
    const data = newAccount.save();
    res.send(newAccount)
})


//add todo against userid
app.post('/:userid', (req, res) => {
    const userid = req.params.userid;
    const newTodo = {task : req.body.task, todo : req.body.todo, isDeleted : 0};
    model.findOneAndUpdate(
   {userId : userid}, 
   {$push: {formData : newTodo}},
  function (error, result) {
        if (error) {
            res.send(error)
        } else {
            res.send(result);
        }
    })
})


//get todo for a userid
app.post('/getTodo/:userid', (req, res) => {
    const userid = req.params.userid;
    let arr = [];
    model.find(
        {userId : userid},
        async (error, result) => {
            if(error){
                res.json({error : "Oops! No task available"});
            }
            else{
                let final = result[0].formData
                for(i=0; i<final.length; i++){
                    if(final[i].isDeleted == 0){
                        arr.push(final[i]);
                    }
                }
                arr.sort((a, b) => {
                    return a.task - b.task;
                })
                res.send(arr)
            }
        }
    )
})


//get one todo for a userid
app.post('/getTodo/:task/:userid', (req,res) => {
    const userid = req.params.userid;
    const task = req.params.task;
    model.findOne({userId : userid, 'formData.task' : task}, (error, result) => {
        if(!result){
            res.json({Error : "Oops! No such task available!"});
        }
        else{
            let final = result.formData
            for(i=0; i<final.length; i++){
                if(final[i].task == task && final[i].isDeleted == 0){
                    res.send(final[i])
                    break;
                }
                else if (final[i].task == task && final[i].isDeleted == 1){
                    res.send({error : "Oops! No such task available!"})
                    break;
                }
            }
            }
        }
    )
})


//delete any todo
app.post('/delete/:task/:userid', (req, res) => {
    const userid = req.params.userid;
    const task = req.params.task;
    model.findOneAndUpdate({userId : userid, 'formData.task' : task},
        {$set : {'formData.$.isDeleted' : 1}},
        (error, result) => {
            if(error){
                res.send(error);
            }
            else{
                let final = result.formData;
                for(i=0; i<final.length; i++){
                    if(final[i].task == task){
                        res.send(final[i])
                    }
                }
            }
        })
})

//update any todo
app.post('/update/:task/:userid', (req, res) => {
    const userid = req.params.userid;
    const task = req.params.task;
    model.findOneAndUpdate({userId : userid, 'formData.task' : task},
        {$set : {'formData.$.task' : req.body.task, 'formData.$.todo' : req.body.todo}}, 
        (error, result) => {
        if(!result){
            res.send({error : "No such task available"});
        }
        else{
           let final = result.formData;
           
           
           for(i=0; i<final.length; i++){
               if(final[i].task == task && final[i].isDeleted == 0){
                   res.send(req.body);
                   break
               }
               else if(final[i].task != task){
                   continue
               }
               else{
                   res.send({error : "no task"});
                   break
               }
           }
        }
    })
})

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));