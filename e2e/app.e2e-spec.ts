import { LandUsePlanningPublicPage } from './app.po';

describe('Land Use Planning Public App', () => {
  let page: LandUsePlanningPublicPage;

  beforeEach(() => {
    page = new LandUsePlanningPublicPage();
  });

  it('should display message saying app works', async () => {
    await page.navigateTo();
    const text = await page.getParagraphText();
    expect(text).toEqual('app works!');
  });
});
