import { LinkifyPipe } from './linkify.pipe';

describe('LinkifyPipe', () => {
  it('create an instance', () => {
    const pipe = new LinkifyPipe();
    expect(pipe).toBeTruthy();
  });

  it('turns urls into anchor tags', () => {
    const pipe = new LinkifyPipe();

    const initialString = 'This is a string www.google.com/some/extension/ with a url in it.';
    const expectedString =
      // tslint:disable-next-line:max-line-length
      'This is a string <a href="www.google.com/some/extension/" target="_blank">www.google.com/some/extension/</a> with a url in it.';

    expect(pipe.transform(initialString)).toEqual(expectedString);
  });
});
