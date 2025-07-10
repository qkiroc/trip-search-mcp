import {getTrainInfoBy12306} from '../services/trainSearch';

describe('Train Search Service', () => {
  test('should return train information for a given route and date', async () => {
    const {trainInfo, url} = await getTrainInfoBy12306({
      depStation: '北京',
      arrStation: '上海',
      depDate: '2023-10-01'
    });

    expect(trainInfo).toBeDefined();
    expect(trainInfo.length).toBeGreaterThan(0);
    expect(url).toContain('https://www.12306.cn');

    // Check if the first train info has expected properties
    const firstTrain = trainInfo[0];
    expect(firstTrain.train).toBeDefined();
    expect(firstTrain.startStation).toBeDefined();
    expect(firstTrain.endStation).toBeDefined();
    expect(firstTrain.startTime).toBeDefined();
    expect(firstTrain.endTime).toBeDefined();
    expect(firstTrain.duration).toBeDefined();
    expect(firstTrain.priceInfo.length).toBeGreaterThan(0);
  });
});
