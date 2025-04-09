import { createRoot } from "react-dom/client";
import { enableElementSelection } from "./services";
import Button from "@mui/material/Button";

const Popup = () => {
  return (
    <div>
      <Button variant="contained" onClick={enableElementSelection}>
        Enable Element Selection
      </Button>
    </div>
  );
};

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<Popup />);
