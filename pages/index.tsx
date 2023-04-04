import { Answer } from "@/components/Answer/Answer";
import { Chunk } from "@/types";
import {
  IconArrowRight,
  IconExternalLink,
  IconListNumbers,
  IconSearch,
} from "@tabler/icons-react";
import endent from "endent";
import { KeyboardEvent, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>("");
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  const [keywordsOutput, setKeywordsOutput] = useState<string>("");
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleKeywords = async () => {
    setKeywordsOutput("");
    const keywordPrompt = endent`
    ${keywordsInput}
    ---
    Extrahiere 10 Keywords aus der Liste. Die Keywords sollen möglichst unterschiedlich sein. Gibt mir nur eine Liste mit den Keywords.
    `;

    const getKeyWordsResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: keywordPrompt }),
    });

    if (!getKeyWordsResponse.ok) {
      setLoading(false);
      throw new Error(getKeyWordsResponse.statusText);
    }

    const keywordData = getKeyWordsResponse.body;

    if (!keywordData) {
      return;
    }

    setLoading(false);

    const keywordReader = keywordData.getReader();
    const keywordDecoder = new TextDecoder();
    let keywordsDone = false;

    while (!keywordsDone) {
      const { value, done: doneReading } = await keywordReader.read();
      keywordsDone = doneReading;
      const chunkValue = keywordDecoder.decode(value);
      setKeywordsOutput((prev) => prev + chunkValue);
    }
  };

  const handleAnswer = async () => {
    if (!query || !keywordsInput) {
      alert("Please enter a query and keywords.");
      return;
    }

    setAnswer("");
    setChunks([]);
    setLoading(true);

    const searchResponse = await fetch("/api/crawl", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!searchResponse.ok) {
      setLoading(false);
      throw new Error(searchResponse.statusText);
    }

    const results: Chunk[] = await searchResponse.json();

    setChunks(results);

    const prompt = endent`
    Schreibe einen kreativen Blogpost über ${results[0].title}.

    Verwende diese Keywords so oft wie möglich:
    ${keywordsOutput}

    Erwähne diese Produkte ganz kurz im Post:
    ${results
      ?.map((d: any, i) => {
        if (i > 0) return d.title;
      })
      .join("\n")}

    Das wichtigste ist aber, dass diese Wörter so oft wie möglich vorkommen (falls Zahlen als Keyword vorkommen kannst du diese ignorieren):
    ${keywordsOutput}
    `;

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!answerResponse.ok) {
      setLoading(false);
      throw new Error(answerResponse.statusText);
    }

    const data = answerResponse.body;

    if (!data) {
      return;
    }

    setLoading(false);

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setAnswer((prev) => prev + chunkValue);
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAnswer();
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 sm:pt-8">
            <div className="relative w-full mt-4">
              <IconListNumbers className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:right-3 sm:top-4 sm:h-8" />
              <input
                className="h-12 w-full rounded border border-zinc-600 pr-12 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                type="text"
                placeholder="Enter Keywords..."
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
              />
              <button>
                <IconArrowRight
                  onClick={handleKeywords}
                  className="absolute right-2 top-2.5 h-7 w-7 rounded bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10 text-white"
                />
              </button>
            </div>
            <div className="relative w-full mt-4">
              <IconSearch className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />
              <input
                ref={inputRef}
                className="h-12 w-full rounded border border-zinc-600 pr-12 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-800 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                type="text"
                placeholder="Enter a url from Geschenkidee..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button>
                <IconArrowRight
                  onClick={handleAnswer}
                  className="absolute right-2 top-2.5 h-7 w-7 rounded bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10 text-white"
                />
              </button>
            </div>

            {loading ? (
              <div className="mt-6 w-full">
                <div>
                  <div className="font-bold text-2xl">Loading</div>
                  <div className="animate-pulse mt-2">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded mt-2"></div>
                    <div className="h-4 bg-gray-300 rounded mt-2"></div>
                    <div className="h-4 bg-gray-300 rounded mt-2"></div>
                    <div className="h-4 bg-gray-300 rounded mt-2"></div>
                  </div>
                </div>
              </div>
            ) : keywordsOutput ? (
              <>
                <div className="mt-6 whitespace-pre-wrap w-full">
                  <div className="font-bold text-2xl mb-2">Generated Keywords</div>
                  <Answer text={keywordsOutput} />
                </div>

                <div className="mt-6 whitespace-pre-wrap w-full">
                  <div className="font-bold text-2xl mb-2">Generated Text</div>
                  <Answer text={answer} />

                  <div className="mt-6 mb-16">
                    <div className="font-bold text-2xl">References</div>

                    {chunks.map((chunk, index) => (
                      <div key={index}>
                        <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                          <div className="flex justify-between">
                            <div>
                              <div className="font-bold text-xl">{chunk.title}</div>
                              {/* <div className="mt-1 font-bold text-sm">Enter Chunk Description here</div> */}
                            </div>
                            <a
                              className="hover:opacity-50 ml-2"
                              href={chunk.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <IconExternalLink />
                            </a>
                          </div>
                          <div className="mt-2">{chunk.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : chunks.length > 0 ? (
              <div className="mt-6 pb-16 w-full">
                <div className="font-bold text-2xl">References</div>
                {chunks.map((chunk, index) => (
                  <div key={index}>
                    <div className="mt-4 border border-zinc-600 rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-bold text-xl">{chunk.title}</div>
                          {/* <div className="mt-1 font-bold text-sm">Enter Chunk description here</div> */}
                        </div>
                        <a
                          className="hover:opacity-50 ml-2"
                          href={chunk.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <IconExternalLink />
                        </a>
                      </div>
                      <div className="mt-2">{chunk.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 text-center text-lg invisible">
                AI-powered copywriter.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
