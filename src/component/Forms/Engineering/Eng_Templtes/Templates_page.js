// pages/ModuleTemplatesPage.js

import React from "react";
import { Box, Button, Typography } from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";

const Templates_pages = () => {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get("id");
  const navigate = useNavigate();

  const handleAddTemplateClick = () => {
    navigate(`/create_template?module_id=${moduleId}`);
  };
};

export default Templates_pages;
