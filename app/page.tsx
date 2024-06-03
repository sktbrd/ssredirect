'use client'
import OpenAI from "openai";
import { useEffect, useState } from "react";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TwitterRedirect = () => {
  const [tweet, setTweet] = useState<string>('');

  const generateTweet = async (retryCount = 0) => {
    const maxRetries = 5;
    const backoffDelay = 1000 * (2 ** retryCount);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Generate a tweet about being with ShapeShift in RareEvo event with no Hashtags." }
        ],
      });
      const tweetContent = completion.choices[0]?.message?.content ?? '';
      setTweet(tweetContent);
      console.log(completion.choices[0]);

      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetContent)}`;
      window.open(url, '_blank');

      window.location.href = 'https://shapeshift.com/rareevo';
    } catch (error) {
      if ((error as any).status === 429 && retryCount < maxRetries) {
        console.log(`Rate limit reached. Retrying after ${backoffDelay}ms...`);
        await delay(backoffDelay);
        generateTweet(retryCount + 1);
      } else {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    generateTweet();
  }, []);

  return (
    <>
      <img src="https://assets.coingecko.com/coins/images/9988/large/FOX.png?1696510025" alt="background" className="bg-image" />
    </>
  );
};

export default TwitterRedirect;
