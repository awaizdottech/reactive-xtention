import { Popper } from "@mui/material";
import { FC, ReactNode } from "react";

interface PopperProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  children: ReactNode;
}

const CustomPopper: FC<PopperProps> = ({ anchorEl, open, children }) => {
  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="right-start"
      disablePortal
    >
      {children}
    </Popper>
  );
};

export default CustomPopper;
