const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const model = require('./schema');

const app = express();
const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/test", {useNewUrlParser : true}, () => console.log('connected to database'))

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send("hello world!")
})

app.post('/', (req, res) => {
    const newData = new model({
        formData : {
            task : req.body.task,
            todo : req.body.todo
        },
        userId : req.body.userId,
        username : req.body.username
    })
    const data = newData.save();
    res.send(newData)
})


app.post('/:userid', (req, res) => {
    const userid = req.params.userid;
    const newTodo = {task : req.body.task, todo : req.body.todo};
    model.findOneAndUpdate(
   {userId : userid}, 
   {$push: {formData : newTodo}},
  function (error, result) {
        if (error) {
            console.log(error);
        } else {
            res.send(result);
        }
    })
})

app.post('/gettodo/:userid', (req, res) => {
    const userid = req.params.userid;
    model.find(
        {userId : userid},
        (error, result) => {
            if(error){
                res.send(error);
            }
            else{
                let final = result[0].formData;
                console.log(final)
                final.sort((a, b) => {
                    return a.task - b.task;
                });
                console.log(final)
                res.send(final)
            }
        }
    )
})

app.post('/gettodo/:task/:userid', (req,res) => {
    const userid = req.params.userid;
    const task = req.params.task;
    model.findOne({userId : userid}, (error, result) => {
        if(!result){
            res.json({Error : "No such task available!"});
        }
        else{
            let final = result.formData;
            final.sort((a, b) => {
                return a.task - b.task;
            });
            res.send(final[task-1])
        }
    })
})

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));