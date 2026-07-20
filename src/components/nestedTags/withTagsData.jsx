import { useState, useEffect } from "react";
import {
  convertToTree,
  findChildrenNodesByParentId,
  findRootNodeByCurrentChildId,
  findPathNameFromLeafToRoot,
  findParentNodesByCurrentChildId,
} from "/src/utils/atlaskitTree";

export const withTagsData = (WrappedComponent, { isForSearch }) => {
  const NewComponent = (props) => {
  const {
    isFetchingCategories,
    wholeCategoryFlatItems,
    appliedCategoryFlatItems,
    setNewAppliedCategoryIds,
    setCategoryIdsToDelete,
    activeTag,
  } = props;
    const [categoryTreeItems, setCategoryTreeItems] = useState([]);
    const [appliedCategoryNodes, setAppliedCategoryNodes] = useState([]);
    const [unappliedCategoryTree, setUnappliedCategoryTree] = useState({});
    const [isAddEnabled, setIsAddEnabled] = useState(false);
    const [parentTagNodes, setParentTagNodes] = useState([]);

    const applyCategoryChanges = (updatedAppliedCategoryNodes) => {
      setAppliedCategoryNodes(updatedAppliedCategoryNodes)
      const updatedAppliedCategoryIds = []
      const updatedAppliedCategoryParentIds = []
      updatedAppliedCategoryNodes.forEach(node => {
        node.id !== 0 && updatedAppliedCategoryIds.push(node.id)
        findParentNodesByCurrentChildId(categoryTreeItems, node.id)
          .forEach(parentNode => {
            parentNode.id !== 0 && updatedAppliedCategoryParentIds.push(parentNode.id)
          })
      })
      setNewAppliedCategoryIds([ ...updatedAppliedCategoryIds, ...updatedAppliedCategoryParentIds ])
    }

    const deleteAppliedCategoryPath = (parentNodeId) => {
      const childIds = []
      findChildrenNodesByParentId(parentNodeId, categoryTreeItems).forEach(childNode => childIds.push(childNode.id))
      const distinctChildIds = [...new Set(childIds)]
      const categoryNodeIdsToDelete = [ ...distinctChildIds, parentNodeId ]
      setCategoryIdsToDelete(categoryNodeIdsToDelete)
      const removedSelectedAppliedCategoryNode = Object.values(appliedCategoryNodes)
        .filter(value => !categoryNodeIdsToDelete.includes(value.id))
      applyCategoryChanges(removedSelectedAppliedCategoryNode)
    }

    const addAppliedCategoryPath = (addedNode) => {
      const addedAppliedCategoryNodes = [ ...appliedCategoryNodes, addedNode ]
      applyCategoryChanges(addedAppliedCategoryNodes)
    }

    const updateAppliedCategories = (newAppliedCategoryNode, subTagIndex) => {
      const otherAppliedCategoryNodes =
        appliedCategoryNodes.map((node, index) => index !== subTagIndex && node).filter(node => !!node)
      const updatedAppliedCategoryNodes = [ ...otherAppliedCategoryNodes, newAppliedCategoryNode ]
      applyCategoryChanges(updatedAppliedCategoryNodes)
    }

    useEffect(() => {
      if (!isFetchingCategories) {
        setCategoryTreeItems(convertToTree(wholeCategoryFlatItems || [], false)?.items);
        if (appliedCategoryFlatItems?.length && !isForSearch) {
          const appliedCategoryTreeItems = convertToTree(appliedCategoryFlatItems, true)?.items;
          setAppliedCategoryNodes(Object.values(appliedCategoryTreeItems)
            .filter((value) => !value.hasChildren && value.id !== 0));
        }
      }
    }, [wholeCategoryFlatItems, appliedCategoryFlatItems, isFetchingCategories]);

    useEffect(() => {
      if (!isForSearch) {
        if (!!wholeCategoryFlatItems.length) {
          setUnappliedCategoryTree(convertToTree(wholeCategoryFlatItems, false))
          setIsAddEnabled(true)
        }
        if (!appliedCategoryNodes.length) setParentTagNodes([]);
        if (appliedCategoryNodes.length) {
          const appliedCategoryParentNodes = appliedCategoryNodes.map((node) =>
            findRootNodeByCurrentChildId(categoryTreeItems, node.id));
          appliedCategoryNodes.forEach((appliedCategoryLeaf, index) => {
            const {
              data: { name: categoryName, sourceId: categorySourceId },
            } = appliedCategoryLeaf;
            if (!categorySourceId) {
              Object.values(categoryTreeItems).forEach((value) => {
                if (value.id === appliedCategoryLeaf.id) {
                  appliedCategoryParentNodes[index] = {
                    ...value,
                    data: {
                      ...value.data,
                      name: value.data.originalName
                    }
                  }
                }
              })
            } else {
              const pathNameFromAppliedCategoryToRoot
                = findPathNameFromLeafToRoot(wholeCategoryFlatItems, categorySourceId, categoryName)
              appliedCategoryParentNodes[index].data.name = pathNameFromAppliedCategoryToRoot
            }
          });
          setParentTagNodes(appliedCategoryParentNodes);
          const appliedChildIds = []
          appliedCategoryParentNodes?.forEach(parentNode => findChildrenNodesByParentId(parentNode.id, categoryTreeItems)
            .forEach(childNode => appliedChildIds.push(childNode.id)))
          const appliedCategoryParentIds = appliedCategoryParentNodes.map(parentNode => parentNode.id)
          const appliedCategoryIds = appliedCategoryParentIds.concat(appliedChildIds)
          const wholeCategoryIds = wholeCategoryFlatItems.map(item => item.id)
          const unappliedCategoryIds = wholeCategoryIds.filter(id => !appliedCategoryIds.includes(id));
          if (!!unappliedCategoryIds.length) {
            const unappliedCategoryNodes = Object.values(categoryTreeItems)
              .filter(value => unappliedCategoryIds.includes(value.id))
            const sortedUnappliedCategoryNodes = unappliedCategoryNodes
              .sort((a, b) => (a.data.displaySequence > b.data.displaySequence) ? 1 : -1)
            let unappliedCategoryFlatItems = []
            sortedUnappliedCategoryNodes
              .forEach(unappliedNode => unappliedCategoryFlatItems
                .push({
                  ...unappliedNode.data,
                  name: unappliedNode.data.originalName
                })
              )
            setUnappliedCategoryTree(convertToTree(unappliedCategoryFlatItems, false))
            setIsAddEnabled(true)
          } else {
            setUnappliedCategoryTree({})
            setIsAddEnabled(false)
          }
        }
      }
    }, [appliedCategoryNodes])

    useEffect(() => {
      if (isForSearch) {
        if (!isFetchingCategories) {
          const categoryParentNodes = Object.values(categoryTreeItems).filter(
            (value) => !value.data.sourceId && value.id !== 0
          );
          categoryParentNodes.sort((a, b) => a.data.displaySequence - b.data.displaySequence)
          setParentTagNodes([
            { data: { id: 0, name: "all", originalName: "all" } },
            ...categoryParentNodes,
          ]);
        }
      }
    }, [categoryTreeItems, isFetchingCategories]);

    useEffect(() => {
      if (isForSearch && activeTag.subTagIndex) {
        const { name: activeTagName, sourceId: activeTagSourceId } = activeTag;
        const pathNameFromActiveTagToRoot = findPathNameFromLeafToRoot(wholeCategoryFlatItems, activeTagSourceId, activeTagName)
        const tempParentTagNodes = [...parentTagNodes];
        tempParentTagNodes[activeTag.subTagIndex].data.name = pathNameFromActiveTagToRoot
        setParentTagNodes(tempParentTagNodes);
      }
    }, [activeTag]);

    return (
      <WrappedComponent
        {...props}
        {...(!isForSearch && {
          wholeCategoryFlatItems,
          appliedCategoryNodes,
          deleteAppliedCategoryPath,
          updateAppliedCategories,
          isAddEnabled,
          unappliedCategoryTree,
          setUnappliedCategoryTree,
          addAppliedCategoryPath,
        })}
        isForSearch={isForSearch}
        categoryTreeItems={categoryTreeItems}
        parentTagNodes={parentTagNodes}
      />
    );
  };
  NewComponent.displayName = `withTagsData(${WrappedComponent.displayName || WrappedComponent.name})`;
  return NewComponent;
};
