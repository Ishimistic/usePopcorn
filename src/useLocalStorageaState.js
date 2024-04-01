import { useState, useEffect } from "react";
export function useLocalStorageState(initialState, key) {
  //showing the add movie list with initial render; pass a function that react can call later.
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return storedValue? JSON.parse(storedValue) : initialState;
  });
  // useState(localStorage.getItem("watched")); // Never do like this else this will be called with every render

   // Storing add list to local storage
   useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(value));
    },
    [value, key]
  );
  return [value, setValue];
}
