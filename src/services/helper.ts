import {Page} from 'playwright';

/**
 * 滚动页面直到所有内容加载完成
 * @param page Playwright页面对象
 * @param maxScrollAttempts 最大滚动次数，默认30次
 * @param scrollStep 每次滚动的像素数，默认600px
 * @param waitTime 每次滚动后的等待时间，默认1000ms
 * @param unchangedThreshold 连续多少次页面高度不变认为加载完成，默认3次
 */
export async function scrollToLoadAllContent(
  page: Page,
  maxScrollAttempts: number = 30,
  scrollStep: number = 600,
  waitTime: number = 1000,
  unchangedThreshold: number = 3
): Promise<void> {
  let oldScrollHeight = await page.evaluate(() => {
    return document.body.scrollHeight;
  });
  let scrollHeight = scrollStep;
  let unchangedCount = 0;

  for (let i = 0; i < maxScrollAttempts; i++) {
    await page.evaluate(scrollHeight => {
      window.scrollTo(0, scrollHeight);
    }, scrollHeight);
    scrollHeight += scrollStep;

    // 等待页面加载
    await page.waitForTimeout(waitTime);

    const newScrollHeight = await page.evaluate(() => {
      return document.body.scrollHeight;
    });

    unchangedCount =
      newScrollHeight === oldScrollHeight ? unchangedCount + 1 : 0;
    oldScrollHeight = newScrollHeight;

    if (unchangedCount >= unchangedThreshold) {
      break; // 如果连续指定次数没有变化，认为加载完成
    }
  }
}
