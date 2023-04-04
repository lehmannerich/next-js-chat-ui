import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const chatCompletionHandler = async (req, res) => {
  console.log("Calling:");
  console.log(req.body.prompt);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Du bist ein Copywriter für einen E-Commerce Shop. Du erstellst einen hilfreiche Marketingtexte.",
      },
      {
        role: "user",
        content: req.body.prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });
  res.status(200).json({ result: completion.data.choices[0].message.content });
};

export default chatCompletionHandler;
