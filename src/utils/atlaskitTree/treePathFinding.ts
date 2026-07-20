import { TreeItem, ItemId } from "@atlaskit/tree";
import { Items, FlatItem } from "./types";

export const findChildrenNodesByParentId = (parentId: ItemId, treeItems: Items) => {
  let foundChildNodes: TreeItem[] = [];
  const findChildrenNodes = (parentId: ItemId) => {
    const childrenIds = Object.values(treeItems).find(
      (value) => value.id === parentId && value.hasChildren
    )?.children;
    Object.values(treeItems).forEach((value) => {
      if (childrenIds && childrenIds.includes(value.id)) {
        foundChildNodes = [...foundChildNodes, value];
        if (value.hasChildren)
          childrenIds.forEach((childId) => findChildrenNodes(childId));
      }
    });
    return foundChildNodes;
  };
  findChildrenNodes(parentId);
  return foundChildNodes;
};

export const getSubTree = (targetParentItem: TreeItem, treeItems: Items) => {
  const {
    data: { id: rootId },
  } = targetParentItem;

  const rootObj = {
    [targetParentItem.id]: { ...targetParentItem, data: {} },
  };

  let items: Items = { ...rootObj };
  findChildrenNodesByParentId(rootId, treeItems).forEach(
    (childNode) =>
      (items = {
        ...items,
        [childNode.id.toString()]: {
          ...childNode,
          isExpanded: true,
        },
      })
  );

  const subTree = {
    rootId,
    items,
  };
  return subTree;
};

export const findPathItemsFromLeafToRoot = (
  flatItems: FlatItem[],
  activeItemSourceId: number
) => {
  const foundParentItems: { name: string; id: number }[] = [];
  const findParentItemAndStoreNames = (sourceId: number) => {
    const foundParentItem: FlatItem | undefined = flatItems.find(
      (item) => item.id === sourceId
    );
    if (foundParentItem) {
      foundParentItems.push(foundParentItem);
      if (foundParentItem.sourceId) {
        findParentItemAndStoreNames(foundParentItem.sourceId as number);
      }
    } else return;
  };
  findParentItemAndStoreNames(activeItemSourceId);
  return foundParentItems;
};

export const findPathNameFromLeafToRoot = (
  flatItems: FlatItem[],
  activeItemSourceId: number,
  activeItemName: string
) => {
  const pathItemsFromLeafToRoot: { name: string }[] =
    findPathItemsFromLeafToRoot(flatItems, activeItemSourceId);
  const foundParentItems = pathItemsFromLeafToRoot.map((item) => item.name);
  const pathNameFromLeafToRoot = foundParentItems
    .reverse()
    .concat(activeItemName)
    .join(" - ");
  return pathNameFromLeafToRoot;
};

export const findParentNodesByCurrentChildId = (
  treeItems: Items,
  currentChildId: number
) => {
  const foundParentNodes: TreeItem[] = [];
  let foundParentNode;
  const findParentNode = (childId: number) => {
    foundParentNode = Object.values(treeItems).find((item) =>
      item.children.includes(childId)
    );
    if (foundParentNode) {
      foundParentNodes.push(foundParentNode);
      if (!foundParentNode.data.sourceId) return;
      else findParentNode(foundParentNode.id as number);
    }
  };
  findParentNode(currentChildId);
  return foundParentNodes;
};

export const findRootNodeByCurrentChildId = (
  treeItems: Items,
  currentChildId: number
) => {
  const foundParentNodes = findParentNodesByCurrentChildId(
    treeItems,
    currentChildId
  );
  return foundParentNodes[foundParentNodes.length - 1];
};
