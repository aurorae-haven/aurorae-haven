import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  const screenshotDir = path.join(__dirname, 'playwright-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  console.log('Step 1: Navigating to application...');
  await page.goto('http://localhost:4173');
  await page.waitForTimeout(2000);
  
  // Step 1: Select a routine from Library
  console.log('Step 1: Selecting a routine from Library...');
  await page.click('text=Library');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '01-library-view.png'), fullPage: true });
  
  // Click on the first routine's Start button
  const startButton = page.locator('button:has-text("Start")').first();
  await startButton.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, '02-routine-selected.png'), fullPage: true });
  
  // Step 2: Start the routine
  console.log('Step 2: Starting the routine...');
  await page.click('text=Routines');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, '03-routine-started.png'), fullPage: true });
  
  // Step 3: Pause the step
  console.log('Step 3: Pausing the routine...');
  const pauseButton = page.locator('button:has-text("Pause")');
  if (await pauseButton.isVisible()) {
    await pauseButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '04-routine-paused.png'), fullPage: true });
  } else {
    console.log('Pause button not found, routine may not be running');
  }
  
  // Step 4: Next step (Complete current step to advance)
  console.log('Step 4: Advancing to next step...');
  const completeButton = page.locator('button:has-text("Complete")');
  if (await completeButton.isVisible()) {
    await completeButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '05-next-step.png'), fullPage: true });
  } else {
    console.log('Complete button not found');
  }
  
  // Step 5: Finish the routine (complete all remaining steps)
  console.log('Step 5: Finishing the routine...');
  // Complete multiple steps to finish the routine
  for (let i = 0; i < 5; i++) {
    const completeBtn = page.locator('button:has-text("Complete")');
    if (await completeBtn.isVisible()) {
      await completeBtn.click();
      await page.waitForTimeout(500);
    }
  }
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotDir, '06-routine-completed.png'), fullPage: true });
  
  console.log('Workflow test completed! Screenshots saved to:', screenshotDir);
  
  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Error during workflow test:', err);
  process.exit(1);
});
