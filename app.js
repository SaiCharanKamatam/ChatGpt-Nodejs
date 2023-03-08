const dotenv = require('dotenv')
dotenv.config()
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
            const { promptMessage, len } = req.body

            const completion = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: promptMessage,
                max_tokens: 3000,
                temperature: 0
            });
            const data = completion.data.choices[0].text
            console.log(completion.data.choices[0]);
            // the output format will be same but the input should be given in a proper format so that you get the optimal results from the chatgpt
            
            if (completion.data.choices.length > 0) {
                if (data) {
                    const array = data.split("\n\n").slice(1)
                    // console.log(array)
                    let result = {}
                    let multiple = []
                    for (let i = 0; i < parseInt(len); i++) {
                        let questionArr = array[i].split("\n")
                        // console.log(questionArr);
                        if (i == 0) {
                            multiple.push({
                                "question": questionArr[2],
                                "optionA": questionArr[3],
                                "optionB": questionArr[4],
                                "optionC": questionArr[5],
                                "optionD": questionArr[6],
                                "answer": questionArr[7], /*.split("Answer: ")[1]*/
                                "Difficulty": questionArr[8], /*.split("Difficulty: ")[1]*/
                                "Explanation": questionArr[9] /*.split("Explanation: ")[1]*/
                            })
                        } else {
                            multiple.push({
                                "question": questionArr[0],
                                "optionA": questionArr[1],
                                "optionB": questionArr[2],
                                "optionC": questionArr[3],
                                "optionD": questionArr[4],
                                "answer": questionArr[5], /*.split("Answer: ")[1]*/
                                "Difficulty": questionArr[6], /*.split("Difficulty: ")[1]*/
                                "Explanation": questionArr[7] /*.split("Explanation: ")[1]*/
                            })
                        }
                        // console.log(multiple);

                    }

                    let moreMultiple = []
                    for (let i = parseInt(len); i < 2 * parseInt(len); i++) {
                        let questionArr = array[i].split("\n")

                        if (i == 3) {
                            moreMultiple.push({
                                "question": questionArr[1],
                                "optionA": questionArr[2],
                                "optionB": questionArr[3],
                                "optionC": questionArr[4],
                                "optionD": questionArr[5],
                                "answer": questionArr[6], /*.split("Answer: ")[1]*/
                                "Difficulty": questionArr[7], /*.split("Difficulty: ")[1]*/
                                "Explanation": questionArr[8] /*.split("Explanation: ")[1]*/
                            })
                        } else {
                            moreMultiple.push({
                                "question": questionArr[0],
                                "optionA": questionArr[1],
                                "optionB": questionArr[2],
                                "optionC": questionArr[3],
                                "optionD": questionArr[4],
                                "answer": questionArr[5], /*.split("Answer: ")[1]*/
                                "Difficulty": questionArr[6], /*.split("Difficulty: ")[1]*/
                                "Explanation": questionArr[7] /*.split("Explanation: ")[1]*/
                            })
                        }
                    }
                    // console.log(moreMultiple);
                    let trueFalse = []
                    for (let i = 2 * parseInt(len); i < 3 * parseInt(len); i++) {
                        let questionArr = array[i].split("\n")
                        if (i == 5) {
                            trueFalse.push({
                                "question": questionArr[1],
                                "answer": questionArr[2],
                                "Difficulty": questionArr[3], /*.split("Difficulty: ")[1]*/
                                "Explanation": questionArr[4]
                            })

                        } else {
                            trueFalse.push({
                                "question": questionArr[0],
                                "answer": questionArr[1],
                                "Difficulty": questionArr[2], /*.split("Difficulty: ")[1]*/
                                "Explanation": questionArr[3]
                            })
                            //             }

                        }
                        // console.log(trueFalse);
                        // console.log(moreMultiple);
                        // console.log({
                        //     multiple: multiple,
                        //     trueFalse: trueFalse,
                        //     moreMultiple: moreMultiple
                        // });
                        // res.json({
                        //     "data": {
                        //         multiple: multiple,
                        //         trueFalse: trueFalse,
                        //         moreMultiple: moreMultiple
                        //     }
                        // })

                    }
                }
            }
        } catch (error) {
            console.log(error.message);
            res.json({ "error": error.message })
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

