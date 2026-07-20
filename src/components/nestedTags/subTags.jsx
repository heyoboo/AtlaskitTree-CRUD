export const SubTags = ({ renderItemParams, customParams }) => {
  const { item, provided } = renderItemParams;
  const {
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
  } = customParams;
  const {
    data: itemData,
    hasChildren: hasItemChildren,
    isExpanded: isItemExpanded,
    data: { id: itemId, name: itemName, sourceId },
  } = item;
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <div
        className={`${
          isForSearch
            ? itemId === activeTag.id
              ? customClassNames?.active || "btn-bz"
              : customClassNames?.default || "btn-bz-outline"
            : itemId === appliedCategoryNodes[subTagIndex].id
              ? `${isReadOnly ? "opacity-75" : ""} text-white bg-secondary`
              : isReadOnly
                ? "" : "btn-default"
        }
        flex items-center px-2 py-1 border-0 rounded-none`}
                style={{ ...(isReadOnly && { cursor: "no-drop" }) }}
        onClick={(e) => {
          if (e.defaultPrevented) return;
          if (isForSearch) {
            setActiveTag({
              id: itemId,
              name: itemName,
              sourceId,
              subTagIndex,
            });
           if(setCurrentPage) setCurrentPage(1);
          }
          if (!isForSearch && !isReadOnly) {
            updateAppliedCategories(item, subTagIndex)
            setSubTagIndex(null)
          }
        }}
      >
        {hasItemChildren && (
          <span
            className="pr-2 cursor-pointer text-lg"
            onClick={(e) => {
              if (e.stopPropagation) e.stopPropagation();
              (isItemExpanded ? onCollapse : onExpand)(
                subTagTree,
                setSubTagTree,
                item.id
              );
            }}
          >
            {isItemExpanded ? "-" : "+"}
          </span>
        )}
        <span>{itemData && itemName}</span>
      </div>
    </div>
  );
};
