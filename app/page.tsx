'use client'
import Image from 'next/image';
import OpenAI from "openai";
import { useEffect, useState } from "react";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API || '',
  dangerouslyAllowBrowser: true,
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const TwitterRedirect = () => {
  const [tweet, setTweet] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const generateTweet = async (retryCount = 0) => {
    const maxRetries = 5;
    const backoffDelay = 1000 * (2 ** retryCount);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
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
        console.log(`Rate limit reachedd. Retrying after ${backoffDelay}ms...`);
        await delay(backoffDelay);
        generateTweet(retryCount + 1);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateTweet();
  }, []);

  return (
    <div className="container">
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Loading tweet...</p>
        </div>
      ) : (
        <Image src="https://pbs.twimg.com/profile_banners/2561715571/1714164325/1500x500" alt="background" layout="fill" objectFit="cover" />
      )}
      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          position: relative;
        }
        .spinner-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-top-color: #3498db;
          animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default TwitterRedirect;
