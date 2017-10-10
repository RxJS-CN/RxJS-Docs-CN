import { AppPage } from './app.po';

describe('rxjs-docs App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display title', () => {
    page.navigateTo();
    expect(page.getPageTitle()).toEqual('RxJS Docs');
  });
});
