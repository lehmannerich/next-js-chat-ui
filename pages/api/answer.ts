import { OpenAIStream } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {

  try {
    const { prompt } = (await req.json()) as {
      prompt: string;
    };
    // create a log divider in a pretty color
    // console.log(
    //   "=====================================",
    // );
    // console.log("Calling OpenAIStream with prompt:");
    // console.log(
    //   "=====================================",
    // );
    // console.log(prompt);

    const stream = await OpenAIStream(prompt);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
