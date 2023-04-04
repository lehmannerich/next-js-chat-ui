import * as cheerio from "cheerio";

export const config = {
  runtime: "edge"
};

const getDetails = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const description = $(".description").text();

  return description;
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query } = (await req.json()) as {
      query: string;
    };

    const chunks = [];
    const response = await fetch(query);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("h1").text();
    const description = $(".campaign-top-banner").remove("h1").text();
    chunks.push({ title, description, url: query });

    const products = $(".product-wrapper").slice(0, 4);
    for (let i = 0; i < products.length; i++) {
      const el = products[i];
      const title = $(el).find(".product-name").text();
      const url = $(el).find("a").attr("href");

      let description;
      if (url) {
        description = await getDetails(url);
      } else {
        description = "No description available";
      }

      chunks.push({ title, description, url });
    }

    return new Response(JSON.stringify(chunks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
