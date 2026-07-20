import { mutateTree } from "@atlaskit/tree";

export const onCollapse = (tree, setTree, itemId) => {
  setTree(mutateTree(tree, itemId, { isExpanded: false }));
};
