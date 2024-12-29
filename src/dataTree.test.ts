import { toTree } from "./dataTree";

test("parse data structure", () => {
  const res = toTree([
    {
      id: 1,
      name: "n1",
      sourceId: null,
    },
    {
      id: 2,
      name: "n2",
      sourceId: 1,
    },
  ]);

  const expected = {
    rootId: 0,
    items: {
      0: {
        id: 0,
        children: [1],
        hasChildren: true,
        isExpanded: true,
        data: {},
      },
      1: {
        id: 1,
        children: [2],
        hasChildren: true,
        isExpanded: true,
        data: {
          id: 1,
          name: "n1",
          parent: 0,
          sourceId: null,
        },
      },
      2: {
        id: 2,
        children: [],
        hasChildren: false,
        isExpanded: true,
        data: {
          id: 2,
          name: "n2",
          parent: 1,
          sourceId: 1,
        },
      },
    },
  };

  expect(res).toStrictEqual(expected);
});
