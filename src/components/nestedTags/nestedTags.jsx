import { useState, useRef } from "react";
import { SubTagsContainer } from "./subTagsContainer";
import { NestedTagAdd } from "./nestedTagAdd"

import { withCustomClassNames } from "./withCustomClassNames";
import { withBadgeForItemPanel } from "./withBadgeForItemPanel";
import { withTagsData } from "./withTagsData";

const NestedTags = (props) => {
  const {
    fullWidth,
    activeTag,
    setActiveTag,
    setCurrentPage,
    isReadOnly,
    isForSearch,
    categoryTreeItems,
    parentTagNodes,
    appliedCategoryNodes,
    deleteAppliedCategoryPath,
    updateAppliedCategories,
    customClassNames,
    itemPanelBadgesWrapperClassNames,
    itemPanelBadgeClassNames,
  } = props;
  const parentTagsContainerRef = useRef();
  const [subTagIndex, setSubTagIndex] = useState(null);
  const [parentTagElement, setParentTagElement] = useState(null);
  return (
    <>
      {(isForSearch || (!isForSearch && !!parentTagNodes.length)) &&
        <div
          ref={parentTagsContainerRef}
          className={`${fullWidth ? "tag-container-full" : "tag-container"}
                    ${itemPanelBadgesWrapperClassNames ? itemPanelBadgesWrapperClassNames : ""}
                    overflow-auto my-1 flex items-center whitespace-nowrap`}
                  >
          {isForSearch && !parentTagNodes.length ? (
            <div className={`px-5
              ${customClassNames?.default || "badge-bz-outline"}`}
            >
              <div
                className={`h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent
                                  ${customClassNames?.default || "text-bz"}`}
                role="status"
              />
            </div>
          ) : (
            parentTagNodes.map((parentTagNode, index) => {
              const {
                data: {
                  id: parentTagId,
                  name: parentTagName,
                  originalName: parentOriginalName,
                },
                hasChildren: parentTagHasChildren,
              } = parentTagNode;
              return (
                <div
                  key={`tag${parentTagId}`}
                  id={`parentTag${isForSearch ? "" : parentTagId}`}
                  className={`flex font-light px-3 mr-2
                  user-select-${isReadOnly ? "auto" : "none"}
                  ${(itemPanelBadgeClassNames && itemPanelBadgeClassNames) ||
                    (activeTag?.id === parentTagId ||
                    activeTag?.subTagIndex === index
                      ? customClassNames?.active || "badge-bz"
                                            : customClassNames?.default || "badge-bz-outline rounded")
                                        }`}
                  style={{ cursor: !isForSearch && isReadOnly ? "auto" : "pointer" }}
                  onClick={() => {
                    if (isForSearch) {
                      setActiveTag(
                        parentTagName === "all"
                          ? { id: 0, name: "all" }
                          : { id: parentTagId, name: parentOriginalName }
                      );
                    if(setCurrentPage) setCurrentPage(1);
                    }
                    if (!isForSearch && !isReadOnly)
                      updateAppliedCategories(parentTagNode, index)
                  }}
                  onMouseEnter={(e) => {
                    setParentTagElement(e);
                    parentTagHasChildren && setSubTagIndex(index);
                    !isReadOnly && !isForSearch && document.querySelector(`#parentTag${parentTagId}`)?.classList.remove("border-white")
                  }}
                  onMouseLeave={() => {
                    setSubTagIndex(null);
                    !isReadOnly && !isForSearch && document.querySelector(`#parentTag${parentTagId}`)?.classList.add("border-white")
                  }}
                >
                  <div className="flex">
                    {(parentTagName === "all" && "All") ||
                      ((activeTag?.subTagIndex === index || !isForSearch)
                        ? parentTagName
                        : parentOriginalName)}
                    {!isForSearch && !isReadOnly && (
                      <span
                        className="flex justify-center items-center ml-1 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteAppliedCategoryPath(parentTagId)
                          setSubTagIndex(null);
                        }}
                      >
                      x
                      </span>
                    )}
                  </div>
                  {subTagIndex === index && !isReadOnly && (
                    <SubTagsContainer
                      isReadOnly={isReadOnly}
                      customClassNames={customClassNames}
                      parentTagsContainerRef={parentTagsContainerRef}
                      parentTagElement={parentTagElement}
                      parentTagNode={parentTagNode}
                      isForSearch={isForSearch}
                      categoryTreeItems={categoryTreeItems}
                      parentTagNodes={parentTagNodes}
                      appliedCategoryNodes={appliedCategoryNodes}
                      updateAppliedCategories={updateAppliedCategories}
                      subTagIndex={subTagIndex}
                      setSubTagIndex={setSubTagIndex}
                      activeTag={activeTag}
                      setActiveTag={setActiveTag}
                      setCurrentPage={setCurrentPage}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>}
      {!isForSearch && <NestedTagAdd { ...props } />}
    </>
  );
};

const NestedTagsForSearch = withCustomClassNames(withTagsData(NestedTags, { isForSearch: true }));
const NestedTagsWithBadgeForItemPanel = withBadgeForItemPanel(NestedTags);
const NestedTagsForItemPanel = withTagsData(NestedTagsWithBadgeForItemPanel, { isForSearch: false });

export { NestedTags, NestedTagsForSearch, NestedTagsForItemPanel };
