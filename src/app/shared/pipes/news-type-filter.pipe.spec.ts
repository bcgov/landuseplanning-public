import { NewsTypeFilterPipe } from './news-type-filter.pipe';
import {News} from 'app/models/news';

describe('NewsTypeFilterPipe', () => {

  const string = 'News';
  let value: News[];
  let expectedResponse: News[];

  const pipe = new NewsTypeFilterPipe();

  describe('given no filter string', () => {
    it('returns items in same order as given', () => {
      value = [new News()];
      expectedResponse = [new News()];

      expect(pipe.transform(value, null).length).toBe(expectedResponse.length);
    });
    it('returns n items', () => {
      value = [
        new News(),
        new News(),
        new News(),
        new News()
      ];
      expectedResponse = [
        new News(),
        new News(),
        new News(),
        new News()
      ];

      expect(pipe.transform(value, null).length).toBe(expectedResponse.length);
    });
  });
  describe('given a valid response', () => {
    it('returns 1 item', () => {
      value = [new News({type: 'News'})];
      expectedResponse = [new News({type: 'News'})];

      expect(pipe.transform(value, string).length).toBe(expectedResponse.length);
    });
    it('returns n items', () => {
      value = [
        new News({type: 'News'}),
        new News({type: 'News'}),
        new News({type: 'News'}),
        new News({type: 'News'})
      ];
      expectedResponse = [
        new News({type: 'News'}),
        new News({type: 'News'}),
        new News({type: 'News'}),
        new News({type: 'News'})
      ];

      expect(pipe.transform(value, string).length).toBe(expectedResponse.length);
    });
  });
  describe('given a mix of different types', () => {
    beforeEach(() => {
      value = [
        new News({type: 'News'}),
        new News({type: 'Public Comment Period'}),
        new News({type: 'News'}),
        new News({type: 'Public Comment Period'})
      ];
      expectedResponse = [
        new News({type: 'News'}),
        new News({type: 'News'}),
      ];
    });
    it('returns two items', () => {
      expect(pipe.transform(value, string).length).toBe(expectedResponse.length);
    });
    it('returns News with same type value as value passed in', () => {
      expect(JSON.stringify(pipe.transform(value, string)[0].type))
        .toBe(JSON.stringify(expectedResponse[0].type));
      expect(JSON.stringify(pipe.transform(value, string)[1].type))
      .toBe(JSON.stringify(expectedResponse[1].type));
    });
  });
});
