import { mutateTree } from "@atlaskit/tree";

export const onExpand = (tree, setTree, itemId) => {
  setTree(mutateTree(tree, itemId, { isExpanded: true }));
};