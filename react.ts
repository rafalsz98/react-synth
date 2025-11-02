import "./setup-dom.ts";

import * as React from "react";
import Note from "./components/Note.tsx";
import { render, cleanup } from "@testing-library/react";

const element = React.createElement(Note, {});

render(element);
cleanup();
