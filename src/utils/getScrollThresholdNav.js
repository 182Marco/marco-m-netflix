const getScrollThreshold = (screenWidth) => {
  switch (true) {
    case screenWidth > 1010:
      return 400;
    case screenWidth > 800:
      return 350;
    case screenWidth > 600:
      return 310;
    case screenWidth > 400:
      return 230;
    default:
      return 160;
  }
};

export { getScrollThreshold };
