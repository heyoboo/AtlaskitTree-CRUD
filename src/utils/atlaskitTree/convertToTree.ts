import { TreeData, TreeItem } from "@atlaskit/tree";

interface Node {
  id: number;
  name: string;
  displaySequence: number;
  sourceId: number | null;
}

export const convertToTree = (flatData: Node[], isExpanded: boolean): TreeData => {
  const rootId = 0;
  const parentMap = new Map<number, number[]>();
  flatData.forEach((node) => {
    const parent = node.sourceId || rootId;
    const children = parentMap.get(parent) || [];
    parentMap.set(parent, children.concat([node.id]));
  });
  const buildItem = (node: Node, children: number[]): TreeItem => ({
    id: node.id,
    children: parentMap.get(node.id) || [],
    hasChildren: children.length > 0,
    isExpanded: isExpanded,
    data: {
      ...node,
      originalName: node.name,
      parent: node.sourceId || 0,
    },
  });
  const rootItem = {
    id: 0,
    children: parentMap.get(0)!,
    hasChildren: !!parentMap.get(0)!?.length,
    isExpanded: true,
    data: {},
  };
  const items = {
    [rootItem.id]: rootItem,
    ...flatData.reduce(
      (acc: object, node) =>
        Object.assign(acc, {
          [node.id]: buildItem(node, parentMap.get(node.id) || []),
        }),
      {}
    ),
  };
  return {
    rootId: 0,
    items,
  };
};
