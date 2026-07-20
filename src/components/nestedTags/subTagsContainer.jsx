import { useState, useEffect, useRef } from "react";
import Tree from "@atlaskit/tree";
import { getSubTree, onExpand, onCollapse } from "/src/utils/atlaskitTree";
import { SubTags } from "./subTags";

export const SubTagsContainer = ({
  isReadOnly,
  customClassNames,
  parentTagsContainerRef,
  parentTagElement,
  isForSearch,
  categoryTreeItems,
  parentTagNodes,
  parentTagNode,
  appliedCategoryNodes,
  updateAppliedCategories,
  activeTag,
  setActiveTag,
  subTagIndex,
  setSubTagIndex,
  setCurrentPage,
}) => {
  const currentTagRef = useRef();
  const [subTagTree, setSubTagTree] = useState({});

  useEffect(() => {
    setSubTagTree(getSubTree(parentTagNode, categoryTreeItems));
  }, [parentTagNode, categoryTreeItems]);

  const getSubTagsContainerStyle = () => {
    const {
      top: parentTagsContainerTop,
      left: parentTagsContainerLeft,
      width: parentTagsContainerWidth,
      height: parentTagsContainerHeight,
    } = parentTagsContainerRef.current.getBoundingClientRect();
    const {
      top: parentTagTop,
      left: parentTagLeft,
      width: parentTagWidth,
      height: parentTagHeight,
    } = parentTagElement.target.getBoundingClientRect();
    const isScrollable =
      parentTagsContainerRef.current.scrollWidth >
      parentTagsContainerRef.current.clientWidth;
    const isLastChild = subTagIndex === parentTagNodes.length - 1;
    const centeredDropdown = {
      left: parentTagsContainerLeft,
      width: parentTagsContainerWidth,
    };
    const leftAlignedDropdown = {
      left: parentTagLeft,
    };
    const rightAlignedDropdown = {
      right: window.innerWidth - parentTagLeft - parentTagWidth,
    };
    return {
      zIndex: 99,
      ...(isForSearch
        ? isScrollable
          ? centeredDropdown
          : isLastChild
            ? rightAlignedDropdown
            : leftAlignedDropdown
        : centeredDropdown),
      top: isForSearch
        ? parentTagsContainerTop + parentTagsContainerHeight - 5
        : parentTagTop + parentTagHeight,
    };
  };
  if (!Object.keys(subTagTree).length) return null;
  return (
    <div
      className="fixed pt-2 rounded"
      style={getSubTagsContainerStyle()}
      ref={currentTagRef}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`overflow-auto p-0
        ${isForSearch
          ? customClassNames?.subTagContainer ||
                      "badge-bz-outline bg-white rounded"
                    : "border bg-white show-scrollbar overflow-auto card-shadow rounded"
        }`}
        style={{ maxHeight: !isForSearch ? "200px" : "" }}
      >
        <Tree
          tree={subTagTree}
          renderItem={(renderItemParams) => (
            <SubTags
              renderItemParams={renderItemParams}
              customParams={{
                isReadOnly,
                customClassNames,
                isForSearch,
                subTagTree,
                setSubTagTree,
                appliedCategoryNodes,
                updateAppliedCategories,
                activeTag,
                setActiveTag,
                subTagIndex,
                setSubTagIndex,
                setCurrentPage,
                onExpand,
                onCollapse,
              }}
            />
          )}
          offsetPerLevel={20}
        />
      </div>
    </div>
  );
};
