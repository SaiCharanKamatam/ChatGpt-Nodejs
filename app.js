require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
app.use(cors())
app.use(bodyParser.json())
mongoose.set('strictQuery', true)
const { infoModel } = require("./models/schema")

const { Configuration, OpenAIApi } = require("openai");
const { json } = require("body-parser")
const apiKey = process.env.API_KEY
const configuration = new Configuration({
    apiKey: apiKey,
});
const openai = new OpenAIApi(configuration);



const main = async () => {
    await mongoose.connect("mongodb+srv://saicharankamatam:Charan0608@cluster0.xsadjnm.mongodb.net/?retryWrites=true&w=majority")
    app.listen(5000, () => console.log("listening"))

    app.post("/questions", async (req, res) => {
        try {
            const { promptMessage } = req.body

            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: promptMessage,
                max_tokens: 2500,
                temperature: 0
            });
            const data = completion.data.choices[0].text
            // console.log(completion.data.choices[0]);
            // console.log(data);
            if (completion.data.choices.length > 0) {
                if (data) {
                    const array = data.split("\n\n").slice(1)
                    console.log(array)
                    let result = []
                    for (let i = 0; i < array.length; i++) {
                        questionArr = array[i].split("\n")
                        let answer
                        for (let i = 0; i < questionArr.length; i++) {
                           
                            console.log(questionArr[i].split("~"));
                            if(questionArr[i].split("~").length>0){
                                if(questionArr[i].split("~")[1]==""){
                                    answer = questionArr[i].split("~")[0]
                                    questionArr[i] = questionArr[i].split("~")[0]
                                    break
                                }
                                if(questionArr[i].split("~")[0][questionArr[i].split("~")[0].length-1]==""){
                                    answer = questionArr[i].split("~")[1]
                                    questionArr[i] = questionArr[i].split("~")[1]
                                    break
                                }
                            }
                            
                        }
                       

                        result.push({
                            "question": questionArr[0],
                            "optionA": questionArr[1],
                            "optionB": questionArr[2],
                            "optionC": questionArr[3],
                            "optionD": questionArr[4],
                            "answer": answer
                        })


                    }
                    res.json({ "data": result })

                    console.log(result);
                }
            }
        } catch (error) {
            console.log(error.message);
            res.json({ "error": error.message, "aa": "aa" })
        }
    })

    // add
    app.post("/add", async (req, res) => {
        try {
            const { promptMessage } = req.body
            const q = await infoModel.find({ question: promptMessage.question })
            if (q.length != 0) {
                res.json("question already exists in the db")
            }
            else {
                const document = await infoModel.create(promptMessage)
                res.json("succesfully added")
            }
        } catch (error) {
            res.json(error.message)
        }
    })

    // getTopic
    app.post("/getTopic", async (req, res) => {
        try {
            const { promptMessage } = req.body

            const document = await infoModel.find({ "topic": promptMessage })
            if (document.length > 0) {
                res.json(document)
            }
            else {
                res.json({ "data": "no related questions" })
            }
        } catch (error) {
            res.json(error.message)
        }
    })
}

main()