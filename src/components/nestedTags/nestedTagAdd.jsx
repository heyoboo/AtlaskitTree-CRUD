import { useState } from "react";
import Tree from "@atlaskit/tree";
import { onExpand, onCollapse } from "/src/utils/atlaskitTree";

export const TagsAdd = ({ renderItemParams, customParams }) => {

  const { item, provided } = renderItemParams;
  const { tree, setTree, addAppliedCategoryPath, onExpand, onCollapse } =
    customParams;
  const {
    data: itemData,
    hasChildren: hasItemChildren,
    isExpanded: isItemExpanded,
    data: { name: itemName },
  } = item;
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <div
        className="flex items-center px-2 py-1 btn-default border-0 rounded-none"
        onClick={() => addAppliedCategoryPath(item)}
      >
        {hasItemChildren && (
          <span
            className={`bi-caret-${isItemExpanded ? "up" : "down"}-fill pr-2`}
            style={{ cursor: "pointer", fontSize: "12px" }}
            onClick={(e) => {
              if (e.stopPropagation) e.stopPropagation();
              (isItemExpanded ? onCollapse : onExpand)(tree, setTree, item.id);
            }}
          />
        )}
        <span>{itemData && itemName}</span>
      </div>
    </div>
  );
};

export const NestedTagAdd = (props) => {
  const {
    isReadOnly,
    isAddEnabled,
    appliedCategoryNodes,
    unappliedCategoryTree,
    setUnappliedCategoryTree,
    addAppliedCategoryPath,
  } = props;

  const [isShowAddCategory, setIsShowAddCategory] = useState(false);
  if (isReadOnly && !appliedCategoryNodes.length) return (
    <div
      className="flex items-center pl-2 text-secondary opacity-75 bg-gray-100"
      style={{ height: "45px", fontSize: "14px", borderBottom: "1px solid rgb(238, 238, 238)" }}
    >
      No Category
    </div>)
  if (!isReadOnly)
    return (
      <div className={`p-2 ${!!appliedCategoryNodes?.length ? "pt-0" : "pt-3"}`}>
        <div
          className="relative card-shadow flex items-center justify-center p-1 select-none rounded-full font-normal text-base w-full"
          style={{
            cursor: isAddEnabled && !isReadOnly ? "pointer" : "no-drop",
            ...((!isAddEnabled || isReadOnly) && { opacity: "50%" }),
          }}
          onClick={() => {
            if (isAddEnabled && !isReadOnly) setIsShowAddCategory(!isShowAddCategory);
          }}
        >
          {!isShowAddCategory ? (
            <>
              Add Category
              <span className="pl-1 text-bz font-bold">+</span>
            </>
          ) : (
            <span className="text-bz">Cancel</span>
          )}
          {isShowAddCategory && (
            <div
              className="show-scrollbar card-shadow overflow-auto absolute left-0 border rounded font-light bg-white w-full"
              style={{ zIndex: 1, top: 40, maxHeight: "200px" }}
            >
              <Tree
                tree={unappliedCategoryTree}
                renderItem={(renderItemParams) => (
                  <TagsAdd
                    renderItemParams={renderItemParams}
                    customParams={{
                      tree: unappliedCategoryTree,
                      setTree: setUnappliedCategoryTree,
                      addAppliedCategoryPath,
                      onExpand,
                      onCollapse,
                    }}
                  />
                )}
                offsetPerLevel={20}
              />
            </div>
          )}
        </div>
      </div>
    );
  else return null
};
