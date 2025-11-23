import React, { useState, useEffect } from "react";
import { Box, Container, Typography } from "@mui/material";
import OptionChainFilters from "./OptionChainFilters";
import OptionChainTable from "./OptionChainTable";

const OptionChain = () => {
  const [optionChain, setOptionChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUnderlying, setSelectedUnderlying] = useState("NIFTY");

  useEffect(() => {
    if (selectedUnderlying) {
      fetchOptionChain(selectedUnderlying);
    }
  }, [selectedUnderlying]);

  const fetchOptionChain = async (underlying: string) => {
    try {
      setLoading(true);
      const url = `http://localhost:6123/open-interest?identifier=${underlying}`;
      console.log("Fetching from URL:", url);
      const response = await fetch(url);
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        setOptionChain(null);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log("Option chain data received:", data);
        setOptionChain(data);
      } else {
        console.error("Expected JSON, but received:", contentType);
        setOptionChain(null);
      }
    } catch (error) {
      console.error("Error fetching option chain:", error);
      setOptionChain(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Option Chain
        </Typography>
        
        <OptionChainFilters 
          selectedUnderlying={selectedUnderlying}
          onUnderlyingChange={setSelectedUnderlying}
        />
        
        {loading ? (
          <Typography>Loading...</Typography>
        ) : optionChain ? (
          <OptionChainTable data={optionChain} />
        ) : (
          <Typography color="error">Failed to load option chain data</Typography>
        )}
      </Box>
    </Container>
  );
};

export default OptionChain;