import * as cheerio from "cheerio";

export const config = {
  runtime: "edge",
};

// Function to get product details
const getDetails = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const description = $(".description").text();

  return description;
};

// Function to get product information
const getProductInfo = async (productElement: any, $: any): Promise<object> => {
  const title = $(productElement).find(".product-name").text();
  const url = $(productElement).find("a").attr("href");

  let description;
  if (url) {
    description = await getDetails(url);
  } else {
    description = "No description available";
  }

  return { title, description, url };
};

// Main handler function
const handler = async (req: Request): Promise<Response> => {
  try {
    const { url, limit } = (await req.json()) as {
      url: string;
      limit: number;
    };

    const chunks = [];
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $("h1").text();
    const description = $(".campaign-top-banner").remove("h1").text();
    chunks.push({ title, description, url });

    const products = $(".product-wrapper").slice(0, limit );
    for (let i = 0; i < products.length; i++) {
      const productElement = products[i];
      const productInfo = await getProductInfo(productElement, $);
      chunks.push(productInfo);
    }

    return new Response(JSON.stringify(chunks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
