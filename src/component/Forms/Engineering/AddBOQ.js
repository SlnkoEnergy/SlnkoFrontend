import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Select,
  Option,
  Modal,
  ModalDialog,
  Typography,
} from "@mui/joy";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetBoqProjectQuery,
  useUpdateBoqProjectMutation,
  useGetBoqTemplateByIdQuery,
  useCreateBoqProjectMutation,
  useLazyGetBoqCategoryByIdAndKeyQuery,
} from "../../../redux/Eng/templatesSlice";

const AddBOQ = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const module_template = searchParams.get("module_template");
  const [createBoqProject] = useCreateBoqProjectMutation();
  const [formData, setFormData] = React.useState({});
  const [modalFormData, setModalFormData] = React.useState({});
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [selected, setSelected] = React.useState("Use Template");
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [openModal, setOpenModal] = React.useState(false);

  const { data: projectRes, isLoading: isProjectLoading } =
    useGetBoqProjectQuery({ projectId, module_template }, { skip: !projectId });

  const { data: templateRes } = useGetBoqTemplateByIdQuery(
    { module_template },
    { skip: !module_template }
  );

  const [triggerGetBoqCategory, { data, isLoading, error }] =
    useLazyGetBoqCategoryByIdAndKeyQuery();

  const boqTemplates = templateRes?.boqTemplates || [];
  const template_id = boqTemplates[0]?._id;

  const [updateBoqProject, { isLoading: isSubmitting }] =
    useUpdateBoqProjectMutation();

  const boqCategoryIdProject = boqTemplates[0]?.boq_category;

  const projectData = projectRes?.data || {};

  const matchedCategories =
    templateRes?.moduleTemplate?.matchedCategories || [];

  const headers =
    selected === "Use Template"
      ? projectData?.items?.[0]?.boqCategoryDetails?.headers || []
      : selectedCategory?.headers || [];

  const boqName = projectData?.items?.[0]?.boqCategoryDetails?.name || " ";
  const boqCategoryId = projectData?.items?.[0]?.boqCategoryDetails._id || " ";

  const handleChange = (key) => (e) => {
    console.log("Updating key:", key, "with value:", e.target.value);
    setFormData((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleModalInputChange = (name, index, value) => {
    setModalFormData((prev) => {
      const updated = [...(prev?.[name] || [])];
      updated[index] = { input_values: value }; // ✅ wrap in object
      return { ...prev, [name]: updated };
    });
  };

  console.log("modal:", modalFormData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked");

    const formattedData = headers.map((header) => {
      const values =
        selected === "Use Template"
          ? [
              {
                input_values: formData[header.name] || "",
              },
            ]
          : modalFormData[header.name] || [];

      return {
        name: header.name,
        values,
      };
    });

    console.log("values :", formattedData); // This should print

    try {
      await updateBoqProject({
        projectId,
        module_template,
        data: formattedData,
      }).unwrap();

      alert("BOQ updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update BOQ");
    }
  };

  const handleCategorySelect = (_, val) => {
    setSelected(val);
    const cat = matchedCategories.find((c) => c.name === val);
    if (cat) {
      setSelectedCategory(cat);
      setOpenModal(true);

      const matchedTemplate = boqTemplates.find((t) => t.category === val);

      const formInit = {};
      matchedTemplate?.data?.forEach((d) => {
        formInit[d.name] = d.values;
      });

      setModalFormData(formInit);
    }
  };

  useEffect(() => {
    if (!projectData?.items?.length) return;

    const currentData = projectData.items[0].current_data;

    const initialFormData = {};
    currentData.forEach((item) => {
      initialFormData[item.name] = item.values?.[0]?.input_values || "";
    });

    console.log("initialData:", initialFormData);
    if (initialFormData) setFormData(initialFormData);
  }, [projectData]);

  useEffect(() => {
    const fetchAllDropdowns = async () => {
      const activeBoqId = openModal ? boqCategoryIdProject : boqCategoryId;

      const promises = headers.map(async (header) => {
        try {
          const res = await triggerGetBoqCategory({
            _id: activeBoqId,
            keyname: header.name.toLowerCase(),
          }).unwrap();

          return { key: header.name, values: res?.data || [] };
        } catch (error) {
          console.error(`Error fetching for ${header.name}`, error);
          return { key: header.name, values: [] };
        }
      });

      const results = await Promise.all(promises);
      const optionsMap = results.reduce((acc, curr) => {
        acc[curr.key] = curr.values;
        return acc;
      }, {});
      setDropdownOptions(optionsMap);
    };

    if ((boqCategoryId || boqCategoryIdProject) && headers.length) {
      fetchAllDropdowns();
    }
  }, [boqCategoryId, boqCategoryIdProject, headers, openModal]);

  useEffect(() => {
    if (projectData?.items?.[0]?.current_data) {
      const initialValues = {};
      projectData.items[0].current_data.forEach((item) => {
        initialValues[item.name] = item.values[0]?.input_values || "";
      });
      setFormData(initialValues);
    }
  }, [projectData]);

  const handleModalSubmit = async () => {
    const formattedData = selectedCategory.headers.map((header) => {
      const values =
        modalFormData?.[header.name]?.length > 0
          ? modalFormData[header.name]
              .map((val) => ({
                input_values:
                  typeof val === "object" ? val.input_values || "" : val || "",
              }))
              .filter((v) => v.input_values !== "")
          : [];

      return {
        name: header.name,
        values,
      };
    });

    const payload = {
      project_id: projectId,
      items: [
        {
          module_template,
          boq_template: template_id,
          data_history: [formattedData],
        },
      ],
    };

    try {
      await createBoqProject({ data: payload }).unwrap();
      alert("BOQ created successfully!");
      setOpenModal(false);
    } catch (error) {
      console.error("Error creating BOQ:", error);
      alert("Failed to create BOQ");
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "background.level1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      {/* Show Template Dropdown if no project items */}
      {!isProjectLoading && !projectData?.items?.length && (
        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <Select
            placeholder="Use Template"
            value={selected}
            onChange={handleCategorySelect}
            sx={{ minWidth: 200 }}
          >
            {matchedCategories.map((cat) => (
              <Option key={cat._id} value={cat.name}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Box>
      )}

      {/* Modal for selected category */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog>
          <Typography level="h4">{selectedCategory?.name}</Typography>
          <Typography>{selectedCategory?.description}</Typography>

          <Stack spacing={2} mt={2}>
            {selectedCategory?.headers?.map((header, index) => {
              const values = modalFormData?.[header.name] || [{}];
              const matchingTemplateItem =
                templateRes?.boqTemplates?.[0]?.data?.find(
                  (item) => item.name === header.name
                );

              return (
                <FormControl key={index}>
                  <FormLabel>{header.name}</FormLabel>
                 <Stack spacing={1}>
  {values.map((val, i) => (
    <select
      key={i}
      value={
        val.input_values ??
        matchingTemplateItem?.values?.[0]?.input_values ??
        ""
      }
      onChange={(e) =>
        handleModalInputChange(header.name, i, e.target.value)
      }
      style={{
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        width: "100%",
      }}
    >
      <option value="" disabled>
        {val.input_values ??
          matchingTemplateItem?.values?.[0]?.input_values ??
          `Select ${header.name}`}
      </option>
      {(dropdownOptions[header.name] || []).map((option, idx) =>
        option !== val.input_values ? (
          <option key={idx} value={option}>
            {option}
          </option>
        ) : null
      )}
    </select>
  ))}
</Stack>

                </FormControl>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Close
            </Button>
            <Button variant="solid" onClick={handleModalSubmit}>
              Update
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Main Form */}
      {!isProjectLoading && !projectData?.items?.length ? (
        <Box sx={{ textAlign: "center" }}>
          <h2>No BOQ project found</h2>
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            maxWidth: 400,
            p: 3,
            borderRadius: "md",
            boxShadow: "sm",
            backgroundColor: "background.surface",
          }}
        >
          <Stack spacing={2}>
            <Typography fontSize="1.2rem" fontWeight="700">
              {boqName}
            </Typography>

            {headers.map((header, i) => {
              const keyname = header.name;
              const isDropdown = true;

              return (
                <FormControl key={i} margin="normal">
                  <FormLabel>{keyname}</FormLabel>
                  {isDropdown ? (
                    <select
                      value={formData[keyname] || ""}
                      onChange={(e) => handleChange(keyname)(e)}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        width: "100%",
                      }}
                    >
                      {formData[keyname] ? (
                        <option value={formData[keyname]} disabled>
                          {formData[keyname]}
                        </option>
                      ) : (
                        <option value="" disabled>
                          Select {keyname}
                        </option>
                      )}

                      {(dropdownOptions[keyname] || [])
                        .filter((option) => option !== formData[keyname]) // avoid duplicating selected
                        .map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  ) : (
                    <Input
                      type={header.input_type}
                      name={keyname}
                      value={formData[keyname] || ""}
                      onChange={(e) => handleChange(keyname)(e)}
                      placeholder={header.placeholder}
                      required={header.required}
                    />
                  )}
                </FormControl>
              );
            })}

            <Button
              type="submit"
              variant="solid"
              color="primary"
              loading={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update BOQ"}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default AddBOQ;
