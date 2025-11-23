import React, { useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

interface OptionChainTableProps {
  data: any;
}

const formatNumber = (n: number | undefined | null) =>
  n == null ? "-" : n.toLocaleString();

const formatChange = (n: number | undefined | null) =>
  n == null ? "-" : (n > 0 ? `+${n.toLocaleString()}` : n.toLocaleString());

const changeColor = (n: number | undefined | null) =>
  n == null ? "#666" : n > 0 ? "#388e3c" : n < 0 ? "#d32f2f" : "#666";

const OptionChainTable: React.FC<OptionChainTableProps> = ({ data }) => {
  const [selectedExpiry, setSelectedExpiry] = useState<string>("");

  console.log("OptionChainTable received data:", data);

  if (!data) {
    return <Typography>No data available</Typography>;
  }

  if (!data.grouped || typeof data.grouped !== "object") {
    console.error("Data structure issue:", { grouped: data.grouped });
    return <Typography>Invalid data structure</Typography>;
  }

  const expiryDates = Object.keys(data.grouped);
  if (expiryDates.length === 0) {
    return <Typography>No expiry data available</Typography>;
  }

  const activeExpiry = selectedExpiry || expiryDates[0];
  const expiryData = data.grouped[activeExpiry];

  if (!expiryData || !expiryData.data || !Array.isArray(expiryData.data)) {
    console.error("No data for expiry:", activeExpiry, expiryData);
    return <Typography>No data available for this expiry</Typography>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Expiry:
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <Select
            value={activeExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            size="small"
          >
            {expiryDates.map((date) => (
              <MenuItem key={date} value={date}>
                {date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Call OI
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Call ΔOI
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Call Volume
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Call IV
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Call LTP
              </TableCell>

              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Strike
              </TableCell>

              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Put LTP
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Put IV
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Put Volume
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Put ΔOI
              </TableCell>
              <TableCell align="center" sx={{ color: "#fff", fontWeight: 700 }}>
                Put OI
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {expiryData.data.map((row: any, idx: number) => {
              const call = row.CE;
              const put = row.PE;
              const callDelta = call?.changeinOpenInterest ?? null;
              const putDelta = put?.changeinOpenInterest ?? null;

              return (
                <TableRow
                  key={idx}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#656565ff",
                      "& td": {
                        fontWeight: 700,
                        color: "#3eb0e9ff",
                      },
                    },
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {/* CALL SIDE - LEFT */}
                  <TableCell align="right" sx={{ fontWeight: 500, color: "#388e3c" }}>
                    {formatNumber(call?.openInterest)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 600, color: changeColor(callDelta) }}
                  >
                    {formatChange(callDelta)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {formatNumber(call?.totalTradedVolume)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500, color: "#ff6f00" }}>
                    {call?.impliedVolatility != null ? call.impliedVolatility.toFixed(2) : "-"}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {call?.lastPrice != null ? call.lastPrice.toFixed(2) : "-"}
                  </TableCell>

                  {/* STRIKE - CENTER */}
                  <TableCell
                    align="center"
                    sx={{ fontWeight: 700, fontSize: "1rem", backgroundColor: "#5c2f0cff" }}
                  >
                    {row.strikePrice}
                  </TableCell>

                  {/* PUT SIDE - RIGHT */}
                  <TableCell align="left" sx={{ fontWeight: 500 }}>
                    {put?.lastPrice != null ? put.lastPrice.toFixed(2) : "-"}
                  </TableCell>
                  <TableCell align="left" sx={{ fontWeight: 500, color: "#ff6f00" }}>
                    {put?.impliedVolatility != null ? put.impliedVolatility.toFixed(2) : "-"}
                  </TableCell>
                  <TableCell align="left" sx={{ fontWeight: 500 }}>
                    {formatNumber(put?.totalTradedVolume)}
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontWeight: 600, color: changeColor(putDelta) }}
                  >
                    {formatChange(putDelta)}
                  </TableCell>
                  <TableCell align="left" sx={{ fontWeight: 500, color: "#d32f2f" }}>
                    {formatNumber(put?.openInterest)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OptionChainTable;