import { useState, useEffect, useRef } from "react";
import Tree, { mutateTree, moveItemOnTree } from "@atlaskit/tree";
import {
  onExpand,
  onCollapse,
  findChildrenNodesByParentId,
} from "/src/utils/atlaskitTree";
import { convertToTree } from "/src/utils/atlaskitTree";

import "./categoryConfiguration.scss";

const TreeItem = ({ renderItemParams, customParams }) => {
  const { item, depth, provided, snapshot } = renderItemParams;
  const {
    tree,
    setTree,
    removeTargetById,
    setIsNestingEnabled,
    onExpand,
    onCollapse,
  } = customParams;
  const { combineTargetFor } = snapshot;
  const [isShowWarning, setIsShowWarning] = useState(false);

  useEffect(() => {
    if (combineTargetFor && depth > 1) {
      setIsShowWarning(true);
      setIsNestingEnabled(false);
    } else {
      setIsNestingEnabled(true);
    }
  }, [combineTargetFor, depth]);

  useEffect(() => {
    if (isShowWarning) {
      const timeout = setTimeout(() => {
        setIsShowWarning(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [isShowWarning]);
  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <div
          className={`
          ${snapshot.isDragging ? "opacity-75" : "opacity-100"}
          relative flex items-center justify-between p-2 mb-2 btn-default border rounded-sm shadow-sm`}
        >
          <div
            className={`
            ${isShowWarning ? "show" : "hide"}
            absolute right-0 p-1 rounded-sm bg-white font-light whitespace-nowrap shadow-sm`}
            style={{
              zIndex: 999,
              top: -26,
              color: "red",
            }}
          >
            Should be less than 3 levels
          </div>
          <span style={{ paddingRight: "5px" }}>
            {item.hasChildren && (
              <span
                className="font-bold text-lg pr-2 text-secondary"
                style={{
                  cursor: "pointer",
                  paddingLeft: "2px",
                }}
                onClick={() =>
                  (item.isExpanded ? onCollapse : onExpand)(
                    tree,
                    setTree,
                    item.id,
                  )
                }
              >
                {item.isExpanded ? "-" : "+"}
              </span>
            )}
            <input
              className="rounded-sm border py-1 px-2"
              type="text"
              value={item.data.name}
              onChange={(e) => {
                const changedNameOfTree = mutateTree(tree, item.id, {
                  data: {
                    ...item.data,
                    name: e.target.value,
                  },
                });
                setTree(changedNameOfTree);
              }}
            />
          </span>
          <span
            className="bi-trash3"
            style={{ cursor: "pointer", color: "red", fontSize: "18px" }}
            onClick={() => removeTargetById(item.id, tree)}
          />
        </div>
      </div>
    </>
  );
};

const EMPTY_TREE = {
  rootId: 0,
  items: {
    0: {
      id: 0,
      children: [],
      hasChildren: false,
      isExpanded: true,
      data: {},
    },
  },
};

const flattenTree = (tree) => {
  const { items } = tree;
  if (!items) return [];
  return Object.keys(items)
    .reduce((result, key) => {
      const childrenIds = items[key].children || [];
      const childrenWithSequence = childrenIds.map((childId, index) => {
        const currentObj = items[childId];
        return {
          ...currentObj,
          data: {
            ...currentObj.data,
            displaySequence: index + 1,
          },
        };
      });
      return result.concat(childrenWithSequence);
    }, [])
    .filter((value) => value.id !== 0)
    .map((item) => ({
      id: item.id,
      name: item.data.name,
      displaySequence: item.data.displaySequence,
      sourceId: item.data.sourceId ?? null,
    }));
};

export const CategoryConfiguration = ({
  categoryFlatItems,
  onClose,
  setIsUpdated,
  disableSave = false,
  onLocalSave,
}) => {
  const treeContainerRef = useRef();
  const [tree, setTree] = useState(EMPTY_TREE);
  const [onDragStartId, setOnDragStartId] = useState(0);
  const [isAddNewItem, setIsAddNewItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isNestingEnabled, setIsNestingEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (categoryFlatItems?.length) {
      setTree(convertToTree(categoryFlatItems, true));
    } else {
      setTree(EMPTY_TREE);
    }
  }, [categoryFlatItems]);

  const findLargestValue = (array, largest) => {
    for (var i = 0; i < array.length; i++) {
      if (+array[i] > +largest) {
        largest = +array[i];
      }
    }
    return largest;
  };

  const onDragStart = (itemId) => {
    setOnDragStartId(+itemId);
  };

  const onDragEnd = (sourcePosition, destinationPosition) => {
    if (!destinationPosition) {
      return;
    }
    const { items } = tree;
    const sourceObj = Object.values(items).find(
      (val) => val.id === onDragStartId,
    );
    const movedTree = moveItemOnTree(tree, sourcePosition, destinationPosition);
    const updatedSourceParentOfTree = mutateTree(movedTree, onDragStartId, {
      data: {
        ...sourceObj?.data,
        sourceId:
          +destinationPosition.parentId === 0
            ? null
            : +destinationPosition.parentId,
        parent: +destinationPosition.parentId,
      },
    });
    const newTree = mutateTree(
      updatedSourceParentOfTree,
      destinationPosition.parentId,
      {
        isExpanded: true,
      },
    );
    setTree(newTree);
  };

  const addNewItem = (newItemName) => {
    const { items } = tree;
    const itemsKeys = items && Object.keys(items);
    const largestKey = itemsKeys
      ? findLargestValue(itemsKeys, +itemsKeys[0])
      : 0;
    const newItemId = largestKey + 1;
    const rootObj = items
      ? Object.values(items)[0]
      : {
          id: 0,
          children: [],
          hasChildren: false,
          isExpanded: true,
          data: {},
        };
    const buildNewItem = () => ({
      id: newItemId,
      children: [],
      hasChildren: false,
      isExpanded: true,
      data: {
        id: newItemId,
        name: newItemName,
        displaySequence: items ? rootObj.children.length + 1 : 1,
        sourceId: null,
        parent: 0,
      },
    });
    const appendedItems = { ...items, [newItemId]: { ...buildNewItem() } };
    const appendedTree = {
      rootId: 0,
      items: {
        ...appendedItems,
        0: {
          ...rootObj,
          children: [...rootObj.children, newItemId],
        },
      },
    };
    setTree(appendedTree);
  };

  const toggleAddNewItem = () => {
    if (isAddNewItem) {
      setNewItemName("");
    }
    setIsAddNewItem(!isAddNewItem);
  };

  const removeTargetById = (targetNodeId, tree) => {
    const { items } = tree;
    const targetObj = Object.values(items).find(
      (val) => val.id === targetNodeId,
    );
    if (targetObj) {
      const childrenIds = findChildrenNodesByParentId(targetNodeId, items).map(
        (childNode) => childNode.id,
      );
      // remove nodes of related children to target and target itself
      const removedNodesOfTargetChildrenAndSelf = Object.keys(items)
        .filter((key) => !childrenIds.includes(+key) && +key !== targetNodeId)
        .reduce((acc, key) => ({ ...acc, [key]: items[key] }), {});
      // remove target id from parentNode.children
      const removedTargetFromParentNode = Object.keys(
        removedNodesOfTargetChildrenAndSelf,
      ).reduce((acc, key) => {
        const restChildren = items[key].children.filter(
          (childId) => childId !== targetNodeId,
        );
        return {
          ...acc,
          ...(+key === targetObj.data.parent
            ? {
                [key]: {
                  ...items[key],
                  ...(!restChildren.length && { hasChildren: false }),
                  ...(!restChildren.length && { isExpanded: false }),
                  children: restChildren,
                },
              }
            : { [key]: items[key] }),
        };
      }, {});
      setTree({ ...tree, items: removedTargetFromParentNode });
    }
  };

  const handleSave = async () => {
    if (!Object.keys(tree).length) return;

    if (disableSave || onLocalSave) {
      const flatItems = flattenTree(tree);
      onLocalSave?.(flatItems);
      setIsUpdated?.(true);
      onClose();
      return;
    }
  };

  return (
    <>
      <div
        className="absolute top-0 left-0 bg-black opacity-75 w-full h-full"
        style={{ zIndex: 1 }}
      />
      <div
        className="absolute flex justify-center items-center top-0 left-0 px-3 py-3 md:py-5 sm:py-5 w-full h-full"
        style={{ zIndex: 99 }}
      >
        <div
          className="relative flex flex-col justify-between bg-white"
          style={{
            maxWidth: "1024px",
            width: "100%",
            maxHeight: "900px",
            height: "100%",
            borderRadius: "8px",
          }}
        >
          <div
            className="flex justify-between items-center px-3 bg-white w-full border-0 border-b"
            style={{ height: "50px", borderRadius: "8px 8px 0 0" }}
          >
            <div className=" text-xl font-light">Category Configuration</div>
            <div
              className="h-5 w-5 cursor-pointer text-gray-700 before:content-['×'] before:text-2xl before:leading-none"
              onClick={onClose}
            />
          </div>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-bz" />
            </div>
          ) : (
            <div
              className="relative flex flex-col p-3 py-0 border-0 border-b"
              style={{ height: "calc(100% - 110px)" }}
              ref={treeContainerRef}
            >
              <div
                className="relative overflow-auto py-3"
                style={{
                  minHeight:
                    treeContainerRef?.current?.getBoundingClientRect().height,
                  maxHeight:
                    treeContainerRef?.current?.getBoundingClientRect().height,
                }}
              >
                {!!Object.keys(tree).length && (
                  <Tree
                    tree={tree}
                    renderItem={(renderItemParams) => {
                      return (
                        <TreeItem
                          renderItemParams={renderItemParams}
                          customParams={{
                            tree,
                            setTree,
                            removeTargetById,
                            setIsNestingEnabled,
                            onExpand,
                            onCollapse,
                          }}
                        />
                      );
                    }}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    isDragEnabled
                    isNestingEnabled={isNestingEnabled}
                    offsetPerLevel={20}
                  />
                )}
                <div
                  className={`
                  ${isAddNewItem ? "" : "btn-default"}
                  flex items-center justify-center p-2 rounded-sm`}
                  style={{
                    border: "1px #aaa dashed",
                    cursor: !isAddNewItem && "pointer",
                  }}
                  onClick={() => !isAddNewItem && toggleAddNewItem()}
                >
                  {isAddNewItem ? (
                    <div className="flex items-center">
                      <input
                        className="rounded-sm border py-1 px-2"
                        placeholder="Category Name"
                        type="text"
                        value={newItemName}
                        style={{ marginRight: "10px" }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setNewItemName(e.target.value)}
                      />
                      <div
                        className="btn-bz p-2 py-1 rounded border"
                        style={{
                          marginRight: "10px",
                          cursor: !newItemName ? "no-drop" : "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (newItemName) {
                            addNewItem(newItemName);
                            toggleAddNewItem();
                          }
                        }}
                      >
                        Add
                      </div>
                      <div
                        className="btn-bz-outline p-2 py-1 rounded border"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAddNewItem();
                        }}
                      >
                        Cancel
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center py-1">
                      Add Category
                      <span className="pl-1 text-bz font-bold">+</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div
            className="flex justify-end items-center px-3"
            style={{ height: "60px" }}
          >
            <div
              className={`${isLoading ? "btn-bz-disabled" : "btn-bz"} flex justify-center items-center`}
              style={{
                cursor: "pointer",
                borderRadius: "10px",
                width: "120px",
                height: "35px",
              }}
              onClick={() => !isLoading && handleSave()}
            >
              Save
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
