export const withCustomClassNames = (WrappedComponent) => {
  const NewComponent = (props) => {
    const { customClassNames } = props;
    return <WrappedComponent {...props} customClassNames={customClassNames} />;
  };
  return NewComponent;
};
