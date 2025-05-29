import React, { useState, useEffect, useRef } from "react";
import "./styles/import-widget.css";
import { isNotLoaded, Loaded, Loading, NotLoaded, Error } from "./utils/load";

export function RenderWidget({ context, app }) {
  const [taskFields, setTaskFields] = useState(NotLoaded());

  useEffect(() => {
    if (isNotLoaded(taskFields)) {
      setTaskFields(Loading());
      app.data
        .invoke("getTaskFields")
        .then((taskFields) => {
          setTaskFields(Loaded(taskFields?.response));
        })
        .catch((error) => {
          setTaskFields(Error(error));
        });
    }
  }, [app, taskFields]);

  const retryLoading = () => {
    setTaskFields(NotLoaded());
  };

  switch (taskFields.status) {
    case "loaded":
      console.log(taskFields.data);
      return (
        <div className="app-wrapper">
          <AppHeader />
          <CSVUploader fields={taskFields.data} app={app} />
        </div>
      );
    case "error":
      return <ErrorState error={taskFields.error} onRetry={retryLoading} />;

    case "not-loaded":
    default:
    case "loading":
      return <Loader />;
  }
}

const AppHeader = () => {
  return (
    <div className="app-header">
      <h1 className="app-title">Data Bridge</h1>
      <p className="app-description">
        Import your CSV data and map it to task fields with our
        <span className="app-highlight"> intelligent field mapping</span>.
        Seamlessly transform spreadsheets into actionable task data in seconds.
      </p>
    </div>
  );
};

const Loader = () => {
  return (
    <div className="custom-loader-container">
      <div className="custom-loader-spinner"></div>
      <div className="custom-loader-text">Loading task fields...</div>
    </div>
  );
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <div className="error-title">Something went wrong</div>
      <div className="error-message">
        {error?.message ||
          "There was an error loading the data. Please try again."}
      </div>
      <button className="error-retry-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
};

// Utility function to get field identifier (fieldName if customField is false, otherwise fieldId)
const getFieldIdentifier = (field) => {
  return field.customField === false ? field.fieldName : field.fieldId;
};

const CSVUploader = ({ fields, app }) => {
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [mappings, setMappings] = useState({});
  const fileInputRef = useRef(null);
  const [documentId, setDocumentId] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
      const doc = await app.docs.uploadDocument(selectedFile);
      setDocumentId(doc.documentId);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv") {
        setFile(droppedFile);
        parseCSV(droppedFile);
      }
    }
  };

  const parseCSV = (csvFile) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const csvText = event.target.result;
      const lines = csvText.split("\n");

      if (lines.length > 0) {
        // Extract header row (first line)
        const headerLine = lines[0].trim();

        // Handle different delimiters (comma, semicolon, tab)
        let delimiter = ",";
        if (headerLine.includes(";")) delimiter = ";";
        else if (headerLine.includes("\t")) delimiter = "\t";

        const headers = headerLine
          .split(delimiter)
          .map((header) => header.trim().replace(/^"|"$/g, ""));

        const cleanHeaders = headers.filter((header) => header);
        setColumns(cleanHeaders);

        // Initialize mappings with empty values
        const initialMappings = {};
        cleanHeaders.forEach((header) => {
          initialMappings[header] = "";
        });
        setMappings(initialMappings);
      }
    };

    reader.readAsText(csvFile);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleMappingChange = (csvColumn, fieldIdentifier) => {
    setMappings((prevMappings) => ({
      ...prevMappings,
      [csvColumn]: fieldIdentifier,
    }));
  };

  const autoMapFields = () => {
    const newMappings = { ...mappings };

    columns.forEach((csvColumn) => {
      // Try to find a matching field by name (case insensitive)
      const matchingField = fields.find(
        (field) => field.fieldLabel.toLowerCase() === csvColumn.toLowerCase()
      );

      if (matchingField) {
        newMappings[csvColumn] = getFieldIdentifier(matchingField);
      }
    });

    setMappings(newMappings);
  };

  const handleSubmit = async () => {
    // Process the mappings here
    console.log("Field mappings:", mappings);
    // Further processing would go here

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target.result;
      const stringifiedCsvData = csvText;

      const projectData = await app.data.get(
        app.data.dataIdentifiers.CURRENT_PROJECT
      );
      console.log(projectData?.project?.projectId);

      app.data.invoke("createTasksFromCsv", {
        csvData: stringifiedCsvData,
        mappings: mappings,
        projectId: projectData?.project?.projectId,
        documentId,
      });
    };

    reader.readAsText(file);
  };

  const handleReplaceFile = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="csv-upload-container">
      {!file ? (
        <div
          className={`upload-area ${isDragging ? "drag-active" : ""}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">📊</div>
          <div className="upload-text">
            Drop your CSV file here or click to browse
          </div>
          <div className="upload-subtext">
            CSV files with headers are supported
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="file-uploaded-container">
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <div className="file-name-large">{file.name}</div>
              <div className="file-columns-count">
                {columns.length} columns detected
              </div>
            </div>
          </div>
          <button className="replace-file-button" onClick={handleReplaceFile}>
            Replace File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept=".csv"
            onChange={handleFileChange}
          />
        </div>
      )}

      {columns.length > 0 && (
        <FieldMapper
          csvColumns={columns}
          taskFields={fields}
          mappings={mappings}
          onMappingChange={handleMappingChange}
          onAutoMap={autoMapFields}
          onSubmit={handleSubmit}
          getFieldIdentifier={getFieldIdentifier}
        />
      )}
    </div>
  );
};

const FieldMapper = ({
  csvColumns,
  taskFields,
  mappings,
  onMappingChange,
  onAutoMap,
  onSubmit,
  getFieldIdentifier,
}) => {
  return (
    <div className="field-mapper-container">
      <div className="field-mapper-title">Map CSV Columns to Task Fields</div>
      <div className="field-mapper-subtitle">
        Select the corresponding task field for each column in your CSV file
      </div>

      <div className="mapping-rows-container">
        {csvColumns.map((column, index) => (
          <div key={index} className="mapping-row">
            <div className="csv-column-label">{column}</div>
            <div className="mapping-arrow">→</div>
            <CustomFieldSelector
              fields={taskFields}
              value={mappings[column] || ""}
              onChange={(value) => onMappingChange(column, value)}
              getFieldIdentifier={getFieldIdentifier}
            />
          </div>
        ))}
      </div>

      <div className="mapping-actions">
        <button className="auto-map-button" onClick={onAutoMap}>
          <span>Auto-Map Fields</span>
        </button>
        <button className="mapping-button" onClick={onSubmit}>
          <span>Apply Mapping</span>
        </button>
      </div>
    </div>
  );
};

const CustomFieldSelector = ({
  fields,
  value,
  onChange,
  getFieldIdentifier,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedField = fields.find((field) => {
    const fieldIdentifier = getFieldIdentifier(field);
    return fieldIdentifier === value;
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm("");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (field) => {
    const fieldIdentifier = getFieldIdentifier(field);
    onChange(fieldIdentifier);
    setIsOpen(false);
  };

  const filteredFields = searchTerm
    ? fields.filter((field) =>
        field.fieldLabel.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : fields;

  const highlightMatch = (text, term) => {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="match-highlight">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="custom-field-selector" ref={dropdownRef}>
      <div
        className={`selected-field ${isOpen ? "active" : ""}`}
        onClick={toggleDropdown}
      >
        <div className="selected-field-text">
          {selectedField ? (
            selectedField.fieldLabel
          ) : (
            <span className="selected-field-placeholder">
              -- Select a field --
            </span>
          )}
        </div>
        <div className="selected-field-icon">{isOpen ? "▲" : "▼"}</div>
      </div>

      {isOpen && (
        <div className="field-dropdown">
          <input
            ref={searchInputRef}
            type="text"
            className="field-search"
            placeholder="Search fields..."
            value={searchTerm}
            onChange={handleSearchChange}
          />

          {filteredFields.length > 0 ? (
            filteredFields.map((field) => {
              const fieldIdentifier = getFieldIdentifier(field);
              return (
                <div
                  key={fieldIdentifier}
                  className={`field-option ${
                    fieldIdentifier === value ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(field)}
                >
                  {highlightMatch(field.fieldLabel, searchTerm)}
                  {field.fieldType && (
                    <span className="field-type-label">{field.fieldType}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-results">No matching fields found</div>
          )}
        </div>
      )}
    </div>
  );
};
