import { TreeData, TreeItem } from "@atlaskit/tree";

const testData = [
  {
    id: 7,
    name: "test1",
    displaySequence: 1,
    sourceId: null,
  },
  {
    id: 8,
    name: "test2",
    displaySequence: 2,
    sourceId: null,
  },
  {
    id: 9,
    name: "test2-1",
    displaySequence: 1,
    sourceId: 8,
  },
  {
    id: 10,
    name: "test2-2",
    displaySequence: 2,
    sourceId: 8,
  },
  {
    id: 11,
    name: "test2-3",
    displaySequence: 3,
    sourceId: 8,
  },
];

export function toTree(): TreeData {
  const rootId = 0;
  // test map for testData
  const testMap = new Map<number, number[]>();
  testData.forEach((node) => {
    const parent = node.sourceId || rootId;
    const children = testMap.get(parent) || [];
    testMap.set(parent, children.concat([node.id]));
  });
  const buildTestItem = (
    node: {
      id: number;
      name: string;
      displaySequence: number;
      sourceId: number | null;
    },
    children: number[]
  ): TreeItem => ({
    id: node.id,
    children: testMap.get(node.id) || [],
    hasChildren: children.length > 0,
    isExpanded: true,
    data: {
      ...node,
      parent: node.sourceId || 0,
    },
  });
  const rootItem = {
    id: 0,
    children: testMap.get(0)!,
    hasChildren: !!testMap.get(0)!.length,
    isExpanded: true,
    data: {},
  };
  const items = {
    [rootItem.id]: rootItem,
    ...testData.reduce(
      (acc, node) =>
        Object.assign(acc, {
          [node.id]: buildTestItem(node, testMap.get(node.id) || []),
        }),
      {}
    ),
  };
  return {
    rootId: 0,
    items,
  };
}

export const dataTree = toTree();