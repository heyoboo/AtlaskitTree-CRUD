export const withBadgeForItemPanel = (WrappedComponent) => {
  const NewComponent = (props) => {
    const { isReadOnly } = props
    const itemPanelBadgesWrapperClassNames = "flex-wrap pt-2 px-2"
    const itemPanelBadgeClassNames = `${isReadOnly ? "opacity-75" : "btn-default border border-white"}
        badge-input text-secondary rounded-full flex mb-2 py-1 text-base`
    return (
      <WrappedComponent
        {...props}
        itemPanelBadgesWrapperClassNames={itemPanelBadgesWrapperClassNames}
        itemPanelBadgeClassNames={itemPanelBadgeClassNames}
      />
    );
  };
  return NewComponent;
};
