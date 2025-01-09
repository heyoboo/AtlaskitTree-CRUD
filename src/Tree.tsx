import { useEffect, useState, } from "react";
import Tree, {
  mutateTree,
  moveItemOnTree,
  RenderItemParams,
  TreeItem,
  ItemId,
  TreeSourcePosition,
  TreeDestinationPosition,
  TreeData,
} from "@atlaskit/tree";
import { dataTree } from "./dataTree";
import findLargestValue from "./findLargestValue";
import "./showWarning.css";

const TestItem = ({
  renderItemParams,
  customParams,
}: {
  renderItemParams: RenderItemParams;
  customParams: {
    tree: TreeData;
    setTree: (tree: TreeData) => void;
    removeTargetById: (targetNodeId: ItemId, tree: TreeData) => void;
    setIsNestingEnabled: (isNestingEnabled: boolean) => void;
  };
}) => {
  const { item, depth, onExpand, onCollapse, provided, snapshot } =
    renderItemParams;
  const { tree, setTree, removeTargetById, setIsNestingEnabled } = customParams;
  const { combineTargetFor, } = snapshot;
  const [isShowWarning, setIsShowWarning] = useState(false);

  useEffect(() => {
    if (combineTargetFor && depth === 3) {
      setIsShowWarning(true);
      setIsNestingEnabled(false);
    } else setIsNestingEnabled(true);
  }, [combineTargetFor, depth]);

  useEffect(() => {
    if (isShowWarning) {
      const timeout = setTimeout(() => {
        setIsShowWarning(false);
      }, 700);
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
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px",
            marginBottom: "5px",
            border: "1px solid #555",
            background: item.hasChildren ? "#555" : "white",
            color: item.hasChildren ? "white" : "#555",
            opacity: snapshot.isDragging && 0.7,
          }}
        >
          <div
            style={{
              zIndex: 9999,
              position: "absolute",
              top: 20,
              left: 15,
              color: "red",
              whiteSpace: "nowrap",
              background: "white",
            }}
            className={`${isShowWarning ? "show" : "hide"}`}
          >
            Only 3 levels allowed
          </div>
          <span style={{ paddingRight: "5px" }}>
            {item.hasChildren && (
              <span
                style={{
                  paddingRight: "5px",
                  fontWeight: "bold",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  (item.isExpanded ? onCollapse : onExpand)(item.id)
                }
              >
                {item.isExpanded ? "-" : "+"}
              </span>
            )}
            {item.id}
            <input
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
          <span>
            <span
              style={{
                marginRight: "5px",
                padding: "2px 10px",
                height: "100%",
                background: item.hasChildren ? "white" : "#555",
              }}
            />
            <span
              style={{ padding: "2px 5px", border: "solid 1px" }}
              onClick={() => removeTargetById(item.id, tree)}
            >
              x
            </span>
          </span>
        </div>
      </div>
    </>
  );
};

export default function TreeApp() {
  const [tree, setTree] = useState(dataTree);
  const [onDragStartId, setOnDragStartId] = useState(0);
  const [isAddNewItem, setIsAddNewItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isNestingEnabled, setIsNestingEnabled] = useState(true);

  useEffect(() => {
    const { items } = tree;
    const itemsWithsequence = Object.keys(items).reduce(
      (result: TreeItem[], key) => {
        const childrenIds = items[key].children;
        const childrenWithSequence = childrenIds.map((childId, index) => {
          let currentObj = items[childId];
          currentObj.data.displaySequence = index + 1;
          return currentObj;
        });
        return result.concat(childrenWithSequence);
      },
      []
    );
    const data = Object.values(itemsWithsequence)
      .filter((value) => value.id !== 0)
      .reduce((acc: TreeItem[], value) => [...acc, value.data], []);

    console.log({ tree, items, data });
  }, [tree]);

  const onExpand = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: true }));
  };

  const onCollapse = (itemId: ItemId) => {
    setTree(mutateTree(tree, itemId, { isExpanded: false }));
  };

  const onDragStart = (itemId: ItemId) => {
    setOnDragStartId(+itemId);
  };

  const onDragEnd = (
    sourcePosition: TreeSourcePosition,
    destinationPosition?: TreeDestinationPosition
  ) => {
    if (!destinationPosition) {
      return;
    }
    const { items } = tree;
    const sourceObj = Object.values(items).find(
      (val) => val.id === onDragStartId
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
      }
    );
    setTree(newTree);
  };

  const addNewItem = (newItemName: string) => {
    const { rootId, items } = tree;
    const itemsKeys = Object.keys(items);
    const largestKey = findLargestValue(itemsKeys, +itemsKeys[0]);
    const newItemId = largestKey + 1;
    const rootObj = Object.values(items)[0];
    const buildNewItem = () => ({
      id: newItemId,
      children: [],
      hasChildren: false,
      isExpanded: true,
      data: {
        id: newItemId,
        name: newItemName,
        displaySequence: rootObj.children.length + 2,
        sourceId: null,
        parent: rootId,
      },
    });
    const appendedItems = { ...items, [newItemId]: { ...buildNewItem() } };
    const appendedTree = {
      rootId,
      items: {
        ...appendedItems,
        [rootId]: {
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

  const removeTargetById = (targetNodeId: ItemId, tree: TreeData) => {
    const { items } = tree;
    const targetObj = Object.values(items).find(
      (val) => val.id === targetNodeId
    );
    if (targetObj) {
      const targetChildrenIds = targetObj.children;
      // remove nodes of related children to target and target itself
      const removedNodesOfTargetChildrenAndSelf = Object.keys(items)
        .filter(
          (key) => !targetChildrenIds.includes(+key) && +key !== targetNodeId
        )
        .reduce((acc, key) => ({ ...acc, [key]: items[key] }), {});
      // remove target id from parentNode.children
      const removedTargetFromParentNode = Object.keys(
        removedNodesOfTargetChildrenAndSelf
      ).reduce((acc, key) => {
        const restChildren = items[key].children.filter(
          (childId) => childId !== targetNodeId
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
  return (
    <div
      style={{
        position: "relative",
        padding: "10px 10px 45px",
        minHeight: "500px",
        maxHeight: "500px",
        overflow: "auto",
      }}
    >
      <Tree
        tree={tree}
        renderItem={(renderItemParams) => {
          return (
            <TestItem
              renderItemParams={renderItemParams}
              customParams={{
                tree,
                setTree,
                removeTargetById,
                setIsNestingEnabled,
              }}
            />
          );
        }}
        // renderItem={Item}
        onExpand={onExpand}
        onCollapse={onCollapse}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        isDragEnabled
        isNestingEnabled={isNestingEnabled}
        offsetPerLevel={20}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "8px",
          width: "calc(100% - 38px)",
          border: "1px #999 dashed",
          cursor: !isAddNewItem ? "pointer" : "default",
        }}
        onClick={() => !isAddNewItem && toggleAddNewItem()}
      >
        {isAddNewItem ? (
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              placeholder="Name"
              type="text"
              value={newItemName}
              style={{ marginRight: "10px" }}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <div
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
          <div>Add</div>
        )}
      </div>
      {/* <div style={{ marginLeft: '5em' }}>
        <p>
          Based on <a href="https://atlaskit.atlassian.com/packages/confluence/tree">@atlaskit/tree</a>, which is referenced
          on <a href="https://github.com/atl  assian/react-beautiful-dnd/blob/master/docs/guides/combining.md">React Beautiful DnD docs</a>
        </p>
      </div> */}
    </div>
  );
}
