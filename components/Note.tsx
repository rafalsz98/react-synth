import { useEffect } from "react";

export default function Note() {
  useEffect(() => {
    console.log("Note!!!");

    setTimeout(() => {
      console.log("Note!!!2");
    }, 2000);
  }, []);

  return null;
}
