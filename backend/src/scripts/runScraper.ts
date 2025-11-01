import { runDailyScraping } from '../jobs/dailyScraper';

async function main() {
  console.log('Starting manual scraping...');
  await runDailyScraping();
  console.log('Scraping completed!');
  process.exit(0);
}

main().catch((error) => {
  console.error('Scraping failed:', error);
  process.exit(1);
});