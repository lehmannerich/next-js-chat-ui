import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import ReactMarkdown, { Components } from "react-markdown";

function Dash() {
  const [numberOfSets, setNumberOfSets] = useState(2);
  const [url, setUrl] = useState("");
  const [limit, setLimit] = useState(8);
  const [data, setData] = useState([]);
  const [prompt1, setPrompt1] = useState("Prompt 1");
  const [prompt1Output, setPrompt1Output] = useState("Prompt 1 Output");
  const [prompt2, setPrompt2] = useState("Prompt 2");
  const [outlines, setOutlines] = useState<string[]>([]);
  const [prompt3, setPrompt3] = useState(
    "Schreibe einen kurzen Blogpost basierend auf dieser Gliederung. Baue ein paar der Produkte in den Text ein und verlinke sie. SCHREIBE IN MARKDOWN. Verlinke die Produkte direkt im Blogpost."
  );
  const [posts, setPosts] = useState<string[]>([]);

  const checkForm = () => {
    if (!url) {
      toast.error("Please enter a URL.");
      return false;
    }
    if (!limit) {
      toast.error("Please enter a limit.");
      return false;
    }
    return true;
  };

  const getData = async () => {
    if (!checkForm()) return;
    const fetchRequest = async () => {
      const response = await fetch("/api/getDataAPI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, limit }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    };

    toast.promise(fetchRequest(), {
      loading: "Fetching data...",
      success: (data) => {
        console.log(data);
        setData(data);
        let createdPrompt = "";
        // add titles to prompt
        data.forEach((item: { title: string }) => {
          createdPrompt += item.title.trim() + "\n";
        });
        createdPrompt += "\n---\n\n";
        createdPrompt +=
          "Denk dir " +
          numberOfSets +
          " kreative Überschriften für Blog Posts aus die diese Produkte betreffen könnten. Am besten alles mit dem Thema '" +
          data[0].title +
          "'. Erwähne die Produkte NICHT nicht den Überschriften. Gehe mehr auf die Menschen und die persönlichen Beziehungen ein.";
        setPrompt1(createdPrompt);
        return <b>Data fetched successfully!</b>;
      },
      error: (error) => {
        console.error(error);
        return <b>Failed to fetch data.</b>;
      },
    });
  };

  const generateFromPrompt = async (prompt: string, setFunction: any) => {
    const fetchRequest = async () => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    };

    toast.promise(fetchRequest(), {
      loading: "Generating text...",
      success: (data) => {
        console.log(data);
        setFunction(data.result);
        return <b>Text generated successfully!</b>;
      },
      error: (error) => {
        console.error(error);
        return <b>Failed to generate text.</b>;
      },
    });
  };

  useEffect(() => {
    console.log("prompt1Output changed");
    let outline = "";
    outline += "Blogposts:\n";
    outline += prompt1Output;
    outline += "\n\n---\n\n";
    outline +=
      "Schlage eine kreative Gliederung vor für einen kurzen Blog post in Punkt {POST_NUMBER}. Inklusive Titel.";
    setPrompt2(outline);
  }, [prompt1Output]);

  function addToOutlinesArray(text: string) {
    setOutlines((prev) => [...prev, text]);
  }

  function addToPostsArray(text: string) {
    setPosts((prev) => [...prev, text]);
  }

  const generateOutlines = async (prompt: string) => {
    setOutlines([]);
    for (let i = 0; i < numberOfSets; i++) {
      let currentPrompt = prompt.replace(/{POST_NUMBER}/g, (i + 1).toString());
      console.log(currentPrompt);
      generateFromPrompt(currentPrompt, addToOutlinesArray);
    }
  };

  const generatePost = async (outlines: string[]) => {
    setPosts([]);
    outlines.forEach((outline: string) => {
      let currentPrompt = outline;
      currentPrompt += "\n\n";
      currentPrompt += "PRODUKTE:\n";
      // loop through data and add titles and urls
      data.forEach((item: { title: string; url: string }) => {
        currentPrompt += "\n\n";
        currentPrompt += item.title.trim();
        currentPrompt += "\n";
        currentPrompt += item.url.trim();
      });
      currentPrompt += "\n\n---\n\n";
      currentPrompt += prompt3;
      console.log(currentPrompt);
      generateFromPrompt(currentPrompt, addToPostsArray);
    });
  };

  const renderers: Partial<Components> = {
    p: ({ children }) => <p className="mb-1">{children}</p>,
    h1: ({ children }) => <h1 className="text-2xl font-bold my-1">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-semibold my-1">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold my-1">{children}</h3>,
    ul: ({ children }) => <ul className="list-disc ml-8 mb-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal ml-8 mb-1">{children}</ol>,
    li: ({ children }) => <li className="mb-2">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 pl-4 italic text-gray-600">{children}</blockquote>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="pt-20 flex flex-col gap-6">
      <div id="container" className="max-w-[760px] mx-auto">
        <h2 className="p-2 font-mono">Pipeline</h2>
        <div id="inputs" className="flex flex-col gap-2 p-2">
          <div className="flex">
            <div className="w-full">
              <h3 className="font-semibold text-xs">URL</h3>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL"
                className="font-medium text-base rounded p-2 border w-full"
                required
              />
            </div>
            <div className="w-full max-w-[100px]">
              <h3 className="font-semibold text-xs">Products</h3>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                placeholder="Limit"
                className="font-medium text-base rounded w-full p-2 border "
                required
              />
            </div>

            <div className="w-full max-w-[100px]">
              <h3 className="font-semibold text-xs">Sets</h3>
              <input
                type="number"
                value={numberOfSets}
                onChange={(e) => setNumberOfSets(parseInt(e.target.value))}
                placeholder="Sets"
                className="font-medium text-base rounded w-full p-2 border "
                required
              />
            </div>
          </div>

          <button
            type="button"
            className="border border-black bg-zinc-900 py-3 px-6 rounded text-white no-underline  hover:bg-zinc-800 w-full font-medium disabled:bg-zinc-700"
            onClick={getData}
          >
            Get Data
          </button>
        </div>

        <div id="data" className="flex flex-col gap-2 p-2 text-xs">
          <h3 className="font-semibold">Data</h3>
          {data.map((item: { title: string; url: string }, index) => (
            <div key={index}>
              <div
                className={`p-2 bg-neutral-50 border rounded ${index === 0 ? "" : ""}`}
              >
                <h4 className="font-medium">{item.title}</h4>
                <p className="">{item.url}</p>
              </div>
            </div>
          ))}
          <h3 className="font-semibold mt-4">Prompt 1</h3>
          <div className={`p-2 bg-neutral-50 border rounded whitespace-pre-wrap`}>
            <p className="">{prompt1}</p>
          </div>
          <button
            type="button"
            className="border border-black bg-zinc-900 py-3 px-6 rounded text-white no-underline  hover:bg-zinc-800 w-full font-medium disabled:bg-zinc-700 text-base"
            onClick={() => {
              generateFromPrompt(prompt1, setPrompt1Output);
            }}
          >
            Generate Headlines
          </button>
        </div>

        <div id="headlines" className="flex flex-col gap-2 p-2 text-xs">
          <h3 className="font-semibold">Headlines</h3>
          <div className={`p-2 bg-neutral-50 border rounded whitespace-pre-wrap`}>
            <p className="">{prompt1Output}</p>
          </div>
          <h3 className="font-semibold mt-4">Prompt 2</h3>
          <div className={`p-2 bg-neutral-50 border rounded whitespace-pre-wrap`}>
            <p className="">{prompt2}</p>
          </div>
          <button
            type="button"
            className="border border-black bg-zinc-900 py-3 px-6 rounded text-white no-underline  hover:bg-zinc-800 w-full font-medium disabled:bg-zinc-700 text-base"
            onClick={() => {
              generateOutlines(prompt2);
            }}
          >
            Generate Outlines
          </button>
        </div>
      </div>
      <div id="container-breakout" className="max-w-[960px] mx-auto w-full">
        <div id="outlines" className="flex flex-col gap-2 p-2 text-xs">
          <h3 className="font-semibold">Outlines</h3>
          <div className="flex gap-2">
            {outlines.map((outline: string, index: number) => (
              <div
                key={index}
                className={`p-2 bg-neutral-50 border rounded whitespace-pre-wrap w-full`}
              >
                <p className="">{outline}</p>
              </div>
            ))}
          </div>
          <h3 className="font-semibold">Prompt 3</h3>
          <div className={`p-2 bg-neutral-50 border rounded whitespace-pre-wrap w-full`}>
            <p className="">{prompt3}</p>
          </div>
          <button
            type="button"
            className="border border-black bg-zinc-900 py-3 px-6 rounded text-white no-underline  hover:bg-zinc-800 w-full font-medium disabled:bg-zinc-700 text-base"
            onClick={() => {
              generatePost(outlines);
            }}
          >
            Generate Posts
          </button>
        </div>
        <div id="posts" className="flex flex-col gap-2 p-2 text-xs">
          <h3 className="font-semibold">Posts</h3>
          <div className="flex gap-2">
            {posts.map((post: string, index: number) => (
              <div
                key={index}
                className={`p-2 bg-neutral-50 border rounded whitespace-pre-wrap w-full`}
              >
                {/* <p>{post}</p> */}
                <ReactMarkdown components={renderers}>{post}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dash;
