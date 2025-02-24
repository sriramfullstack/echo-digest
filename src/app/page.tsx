import Image from "next/image";

import UrlCrawler from './components/UrlCrawler';

export default function Home() {
  return (
    <div className="min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 items-center">
        <div className="flex items-center gap-4">
          <Image
            className="dark:invert"
            src="/logo.svg"
            alt="NuggetLearn Logo"
            width={40}
            height={40}
            priority
          />
          <h1 className="text-2xl font-bold">EchoDigest</h1>
        </div>
        <UrlCrawler />
      </main>
    </div>
  );
}
