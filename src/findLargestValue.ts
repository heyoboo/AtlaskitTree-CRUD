const findLargestValue = (array: any[], largest: number) => {
  for (var i = 0; i < array.length; i++) {
    if (+array[i] > +largest) {
      largest = +array[i];
    }
  }
  return largest;
};

export default findLargestValue;
