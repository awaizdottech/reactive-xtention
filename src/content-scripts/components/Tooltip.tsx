import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";

const CustomTooltip = () => {
  return (
    <Tooltip
      title="I am Tooltip"
      placement="right"
      arrow
      slots={{ transition: Zoom }}
    >
      <QuestionMarkIcon />
    </Tooltip>
  );
};

export default CustomTooltip;
