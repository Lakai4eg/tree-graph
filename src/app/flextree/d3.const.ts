export const chartOptions = {
  blockHeight: 100,
  blockWidth: 200,
  levelHeight: 100,

  chartWidth: 1900,
  chartHeight: 800,
  duration: 700,
};

export const chartData = {
  name: 'NODE NAME 1 ОЧЕНЬ ДЛИННОЕ НАЗВАНИЕ',
  children: [
    ...makeBlocks(2),
    { name: 'NODE NAME 2.1' },
    { name: 'NODE NAME 2.2' },
    {
      name: 'NODE NAME 2.3',
      children: [
        {
          name: 'NODE NAME 3.1',
          children: [{ name: 'NODE NAME 4.1' }],
        },
        {
          name: 'NODE NAME 3.2',
          children: [{ name: 'NODE NAME 4.2' }],
        },
        {
          name: 'NODE NAME 3.3',
          children: [
            { name: 'NODE NAME 4.3' },
            { name: 'NODE NAME 4.4' },
            {
              name: 'NODE NAME 4.5',
              children: [
                {
                  name: 'Level 5 child',
                  children: [
                    {
                      name: 'Level 6.1 child',
                    },
                    {
                      name: 'Level 6.2 child',
                    },
                    ...makeBlocks(5),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    ...makeBlocks(5),
  ],
};

function makeBlocks(count: number): { name: string }[] {
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({ name: `Generated block with long name ${i + 1}` });
  }
  return result;
}
