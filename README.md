# Geschenkidee GPT

AI-powered search and chat for creating descriptions of Geschenkidee.de sites.

All code & data used is 100% open-source.

### Repo Setup

3. Clone repo

```bash
git clone https://github.com/mckaywrigley/paul-graham-gpt.git
```

4. Install dependencies

```bash
npm i
```

5. Set up environment variables

Create a .env.local file in the root of the repo with the following variables:

```bash
OPENAI_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### Dataset

6. Run scraping script

```bash
npm run scrape
```

This scrapes all of the essays from Paul Graham's website and saves them to a json file.

7. Run embedding script

```bash
npm run embed
```

This reads the json file, generates embeddings for each chunk of text, and saves the results to your database.

There is a 200ms delay between each request to avoid rate limiting.

This process will take 20-30 minutes.

### App

8. Run app

```bash
npm run dev
```

## Credits

Thanks to [Paul Graham](https://twitter.com/paulg) for his writing.

I highly recommend you read his essays.

3 years ago they convinced me to learn to code, and it changed my life.

## Contact

If you have any questions, feel free to reach out to me on [Twitter](https://twitter.com/mckaywrigley)!

## Notes

I sacrificed composability for simplicity in the app.

Yes, you can make things more modular and reusable.

But I kept pretty much everything in the homepage component for the sake of simplicity.
