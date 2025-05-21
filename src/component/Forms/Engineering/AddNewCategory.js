import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  IconButton,
  Select,
  Option,
  Checkbox,
  Typography,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CustomForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [customFields, setCustomFields] = useState([]);
  const [showFieldCreator, setShowFieldCreator] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    key: '',
  });

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleCreateField = () => {
    if (!newField.key || !newField.label) return;
    setCustomFields([...customFields, newField]);
    setNewField({
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      key: '',
    });
    setShowFieldCreator(false);
  };

  const handleRemoveField = (keyToRemove) => {
    setCustomFields(customFields.filter((field) => field.key !== keyToRemove));
    const updatedData = { ...formData };
    delete updatedData[keyToRemove];
    setFormData(updatedData);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 700,
          p: 4,
          borderRadius: 'md',
          boxShadow: 'sm',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Typography level="h4">Default Fields</Typography>

        {/* Default Fields */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
            <Input
              placeholder="Enter description"
              value={formData.description}
              onChange={(e) =>
                handleInputChange('description', e.target.value)
              }
            />
          </FormControl>
        </Box>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {customFields.map((field) => (
              <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>
                    {field.label}
                    {field.required && <span style={{ color: 'red' }}> *</span>}
                  </FormLabel>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    required={field.required}
                    onChange={(e) =>
                      handleInputChange(field.key, e.target.value)
                    }
                  />
                </FormControl>
                <IconButton
                  color="danger"
                  onClick={() => handleRemoveField(field.key)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Add Custom Field Form */}
        {showFieldCreator ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 'sm',
              backgroundColor: '#f0f0f0',
            }}
          >
            <FormControl>
              <FormLabel>Label</FormLabel>
              <Input
                value={newField.label}
                onChange={(e) =>
                  setNewField({ ...newField, label: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Key</FormLabel>
              <Input
                value={newField.key}
                onChange={(e) =>
                  setNewField({ ...newField, key: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select
                value={newField.type}
                onChange={(_, value) =>
                  setNewField({ ...newField, type: value || 'text' })
                }
              >
                <Option value="text">Text</Option>
                <Option value="number">Number</Option>
                <Option value="email">Email</Option>
                <Option value="date">Date</Option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Placeholder</FormLabel>
              <Input
                value={newField.placeholder}
                onChange={(e) =>
                  setNewField({ ...newField, placeholder: e.target.value })
                }
              />
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={newField.required}
                onChange={(e) =>
                  setNewField({ ...newField, required: e.target.checked })
                }
              />
              <FormLabel sx={{ ml: 1 }}>Required</FormLabel>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="sm" onClick={handleCreateField}>
                Add Field
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                onClick={() => setShowFieldCreator(false)}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startDecorator={<AddIcon />}
            onClick={() => setShowFieldCreator(true)}
            sx={{ width: 'fit-content' }}
          >
            Add Custom Field
          </Button>
        )}
      </Box>
    </Box>
  );
}
