const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONFIG':
      return { ...state, config: action.payload };
    default:
      return state;
  }
};

export default appReducer;
