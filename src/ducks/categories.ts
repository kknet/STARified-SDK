import { Category } from './../definition';

export const GET_CATEGORIES: string = 'starified/categories/get';

type State = Category[];

const reducer = (state: State = [], action: any): State => {
  switch (action.type) {
    case GET_CATEGORIES:
      return action.payload;
    default:
  }
  return state;
};

export const getCategories = (categories: Category[]) => {
  return {
    type: GET_CATEGORIES,
    payload: categories,
  };
};

export default reducer;
