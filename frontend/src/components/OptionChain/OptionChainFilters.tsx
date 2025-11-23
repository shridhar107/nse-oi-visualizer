import React, { useMemo } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import IDENTIFIERS from "../../identifiers";

interface OptionChainFiltersProps {
  selectedUnderlying: string;
  onUnderlyingChange: (underlying: string) => void;
}

const OptionChainFilters: React.FC<OptionChainFiltersProps> = ({
  selectedUnderlying,
  onUnderlyingChange,
}) => {
  const underlyings = useMemo(() => IDENTIFIERS, []);

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Underlying</InputLabel>
        <Select
          value={selectedUnderlying}
          onChange={(e) => onUnderlyingChange(e.target.value)}
          label="Underlying"
        >
          {underlyings.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default OptionChainFilters;