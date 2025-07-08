import { useEffect, useState } from "react";
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
import { toast } from "react-toastify";

const AddBOQ = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const module_template = searchParams.get("module_template");
  const [createBoqProject] = useCreateBoqProjectMutation();
  const [formData, setFormData] = useState({});
  const [modalFormData, setModalFormData] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [selected, setSelected] = useState("Use Template");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const page = searchParams.get("page");;
  const navigate = useNavigate();

  const { data: projectRes, isLoading: isProjectLoading } =
    useGetBoqProjectQuery(
      { projectId, module_template, version: dataVersion },
      { skip: !projectId }
    );

  const { data: templateRes } = useGetBoqTemplateByIdQuery(
    { module_template },
    { skip: !module_template }
  );

  const [triggerGetBoqCategory] = useLazyGetBoqCategoryByIdAndKeyQuery();

  const boqTemplates = templateRes?.boqTemplates || [];
  const template_id = boqTemplates[0]?._id;
  const [updateBoqProject, { isLoading: isSubmitting }] =
    useUpdateBoqProjectMutation();
  
  

  const boqCategoryIdProject = boqTemplates[0]?.boq_category;
  const projectData = projectRes?.data || {};
  const matchedCategories =
    templateRes?.moduleTemplate?.matchedCategories || [];

  console.log("projectData:", projectData);

  const headers =
    selected === "Use Template"
      ? projectData?.items?.[0]?.current_data || []
      : selectedCategory?.headers || [];

  const boqName = projectData?.items?.[0]?.boqCategoryDetails?.name || " ";
  const boqCategoryId = projectData?.items?.[0]?.boqCategoryDetails?._id || " ";
  const category = searchParams.get("category");

  const handleChange = (key) => (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    setModalFormData((prev) => ({
      ...prev,
      [key]: [{ input_values: value }],
    }));
  };

  const handleModalInputChange = (name, index, value) => {
    setModalFormData((prev) => {
      const updated = [...(prev?.[name] || [])];
      updated[index] = { input_values: value };
      return { ...prev, [name]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = headers.map((header) => {
      const values =
        selected === "Use Template"
          ? [
              {
                input_values: formData?.[header.name] || "",
              },
            ]
          : (modalFormData?.[header.name] || []).filter(
              (v) => v.input_values?.trim() !== ""
            );

      return {
        name: header.name,
        values,
      };
    });

    console.log("modalformdata:", modalFormData);

    try {
      await updateBoqProject({
        projectId,
        module_template,
        data: formattedData,
      }).unwrap();
      toast.success("BOQ updated successfully!");
      setDataVersion((v) => v + 1);
      navigate(`/overview?page=${page}&project_id=${projectId}&category=${category}`);
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update BOQ");
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
    if (
      projectData?.items?.[0]?.current_data &&
      Object.keys(formData).length === 0
    ) {
      const initialData = {};
      projectData.items[0].current_data.forEach((header) => {
        initialData[header.name] = header.values?.[0]?.input_values || "";
      });
      setFormData(initialData);
    }
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

  const handleModalSubmit = async () => {
    const formattedData = selectedCategory.headers.map((header) => {
      const values = (modalFormData?.[header.name] || [])
        .map((val) => ({
          input_values:
            typeof val === "object" ? val.input_values || "" : val || "",
        }))
        .filter((v) => v.input_values !== "");

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
      setDataVersion((v) => v + 1);
    } catch (error) {
      console.error("Error creating BOQ:", error);
      alert("Failed to create BOQ");
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.level1",
      }}
    >
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

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <ModalDialog>
          <Typography level="h4">{selectedCategory?.name}</Typography>
          <Typography>{selectedCategory?.description}</Typography>
          <Stack spacing={2} mt={2}>
            {selectedCategory?.headers?.map((header, index) => {
              const values = modalFormData?.[header.name] || [{}];
              const options = dropdownOptions[header.name] || [];
              return (
                <FormControl key={index}>
                  <FormLabel>{header.name}</FormLabel>
                  <Stack spacing={1}>
                    {values.map((val, i) =>
                      options.length > 0 ? (
                        <select
                          key={i}
                          value={val.input_values || ""}
                          onChange={(e) =>
                            handleModalInputChange(
                              header.name,
                              i,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            width: "100%",
                          }}
                        >
                          <option value="" disabled>
                            {`Select ${header.name}`}
                          </option>
                          {options.map((option, idx) => (
                            <option key={idx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          key={i}
                          type="text"
                          value={val.input_values || ""}
                          onChange={(e) =>
                            handleModalInputChange(
                              header.name,
                              i,
                              e.target.value
                            )
                          }
                          style={{
                            padding: "8px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            width: "100%",
                          }}
                        />
                      )
                    )}
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

      {projectData?.items?.length > 0 && (
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
            {projectData?.items?.[0]?.current_data?.map((header, i) => {
              const options = dropdownOptions[header.name] || [];

              return (
                <FormControl key={i} margin="normal">
                  <FormLabel>{header.name}</FormLabel>
                  {options.length > 0 ? (
                    <select
                      value={
                        formData[header.name] ||
                        header.values?.[0]?.input_values ||
                        ""
                      }
                      onChange={(e) => handleChange(header.name)(e)}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        width: "100%",
                      }}
                    >
                      <option
                        value=""
                        disabled
                      >{`Select ${header.name}`}</option>
                      {options.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData[header.name] ?? ""}
                      onChange={(e) => handleChange(header.name)(e)}
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        width: "100%",
                      }}
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
